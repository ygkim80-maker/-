import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const MODEL = 'claude-haiku-4-5-20251001';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getSystemContext(prisma: PrismaClient): Promise<string> {
  const today = startOfToday();

  const [todayOrders, pendingPOs, productivity, inventories] = await Promise.all([
    prisma.salesOrder.count({ where: { createdAt: { gte: today } } }),
    prisma.purchaseOrder.count({ where: { status: { in: ['PENDING', 'OPEN', 'CONFIRMED'] } } }),
    prisma.productivityLog.aggregate({
      where: { date: { gte: today } },
      _sum: { quantity: true },
    }),
    prisma.inventory.findMany({ include: { item: true } }),
  ]);

  // Compute low stock: total qty per item < reorderPoint
  const qtyByItem = new Map<string, { name: string; sku: string; qty: number; reorder: number }>();
  for (const inv of inventories) {
    const cur = qtyByItem.get(inv.itemId) || {
      name: inv.item.name,
      sku: inv.item.sku,
      qty: 0,
      reorder: inv.item.reorderPoint,
    };
    cur.qty += inv.qty;
    qtyByItem.set(inv.itemId, cur);
  }
  const lowStock = Array.from(qtyByItem.values()).filter((i) => i.qty < i.reorder);

  const lowStockText =
    lowStock.length > 0
      ? lowStock
          .slice(0, 10)
          .map((i) => `- ${i.name} (SKU: ${i.sku}): 재고 ${i.qty} / 재주문점 ${i.reorder}`)
          .join('\n')
      : '- 현재 재고 부족 품목 없음';

  return `당신은 "수도권 풀필먼트 센터"의 AI 운영 어시스턴트입니다.
물류센터 운영자(WMS, OMS, TMS, YMS, LMS)를 돕기 위해 한국어로 친절하고 간결하게 답변합니다.

[실시간 센터 현황]
- 오늘 신규 주문 수: ${todayOrders}건
- 입고 대기(미완료) 발주(PO) 수: ${pendingPOs}건
- 오늘 작업 생산성(처리 수량 합계): ${productivity._sum.quantity ?? 0}개
- 재고 부족 품목 수: ${lowStock.length}건

[재고 부족 품목]
${lowStockText}

위 데이터를 바탕으로 운영 의사결정을 지원하세요. 데이터에 없는 내용은 추정하지 말고 모른다고 답하세요.`;
}

export interface StreamChatParams {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  context: string;
  onChunk: (text: string) => void;
}

export async function streamChat(params: StreamChatParams): Promise<string> {
  const { message, history = [], context, onChunk } = params;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const fallback =
      `[안내] Anthropic API 키가 설정되어 있지 않아 실시간 AI 응답 대신 센터 현황 요약을 제공합니다.\n\n` +
      context +
      `\n\n질문하신 내용: "${message}"\n\n` +
      `API 키(ANTHROPIC_API_KEY)를 설정하시면 더 정확한 대화형 답변을 받으실 수 있습니다.`;
    onChunk(fallback);
    return fallback;
  }

  const client = new Anthropic({ apiKey });
  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user' as const, content: message },
  ];

  let full = '';
  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: context,
    messages: messages as Anthropic.MessageParam[],
  });

  stream.on('text', (text) => {
    full += text;
    onChunk(text);
  });

  await stream.finalMessage();
  return full;
}

export default { getSystemContext, streamChat };
