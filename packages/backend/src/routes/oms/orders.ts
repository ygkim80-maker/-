import { Router, Response } from 'express';
import prisma from '../../db';
import { asyncHandler } from '../../util/asyncHandler';
import { AuthRequest } from '../../middleware/auth';
import { emitEvent } from '../../services/socketService';

const router = Router();

function pagination(req: AuthRequest) {
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.max(1, parseInt((req.query.limit as string) || '20', 10));
  return { page, limit, skip: (page - 1) * limit };
}

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = pagination(req);
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const channelId = (req.query.channelId as string) || '';
    const where: any = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (channelId) where.channelId = channelId;

    const [data, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: { channel: true, shipper: true, lines: { include: { item: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.salesOrder.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const so = await prisma.salesOrder.findUnique({
      where: { id: req.params.id },
      include: {
        channel: true,
        shipper: true,
        lines: { include: { item: true } },
        shipment: true,
      },
    });
    if (!so) {
      res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
      return;
    }
    res.json(so);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      orderNumber,
      channelId,
      shipperId,
      customerName,
      customerAddr,
      customerPhone,
      status,
      slaType,
      requestedShipDate,
      lines,
    } = req.body;
    const so = await prisma.salesOrder.create({
      data: {
        orderNumber: orderNumber || `SO-${Date.now()}`,
        channelId,
        shipperId: shipperId ?? null,
        customerName,
        customerAddr,
        customerPhone: customerPhone ?? null,
        status: status ?? 'NEW',
        slaType: slaType ?? 'STANDARD',
        requestedShipDate: requestedShipDate ? new Date(requestedShipDate) : null,
        lines: Array.isArray(lines)
          ? {
              create: lines.map((l: any) => ({
                itemId: l.itemId,
                orderedQty: l.orderedQty ?? 0,
                price: l.price ?? 0,
              })),
            }
          : undefined,
      },
      include: { lines: true, channel: true },
    });
    emitEvent('order:updated', { id: so.id, status: so.status });
    res.status(201).json(so);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { customerName, customerAddr, customerPhone, status, slaType, requestedShipDate } =
      req.body;
    const so = await prisma.salesOrder.update({
      where: { id: req.params.id },
      data: {
        ...(customerName !== undefined ? { customerName } : {}),
        ...(customerAddr !== undefined ? { customerAddr } : {}),
        ...(customerPhone !== undefined ? { customerPhone } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(slaType !== undefined ? { slaType } : {}),
        ...(requestedShipDate !== undefined
          ? { requestedShipDate: requestedShipDate ? new Date(requestedShipDate) : null }
          : {}),
      },
      include: { lines: true, channel: true },
    });
    emitEvent('order:updated', { id: so.id, status: so.status });
    res.json(so);
  })
);

router.put(
  '/:id/status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body as { status: string };
    const so = await prisma.salesOrder.update({
      where: { id: req.params.id },
      data: { status },
    });
    emitEvent('order:updated', { id: so.id, status: so.status });
    res.json(so);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.salesOrder.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
