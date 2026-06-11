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

// List purchase orders
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = pagination(req);
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const where: any = {};
    if (search) {
      where.OR = [
        { poNumber: { contains: search } },
        { supplier: { name: { contains: search } } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, shipper: true, lines: { include: { item: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        shipper: true,
        lines: { include: { item: true } },
        receipts: { include: { lines: true } },
      },
    });
    if (!po) {
      res.status(404).json({ error: '발주를 찾을 수 없습니다.' });
      return;
    }
    res.json(po);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { poNumber, supplierId, shipperId, status, expectedDate, lines } = req.body;
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        shipperId: shipperId ?? null,
        status: status ?? 'PENDING',
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        lines: Array.isArray(lines)
          ? {
              create: lines.map((l: any) => ({
                itemId: l.itemId,
                orderedQty: l.orderedQty ?? 0,
                receivedQty: l.receivedQty ?? 0,
              })),
            }
          : undefined,
      },
      include: { lines: true, supplier: true },
    });
    res.status(201).json(po);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, expectedDate, supplierId, shipperId } = req.body;
    const po = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(supplierId !== undefined ? { supplierId } : {}),
        ...(shipperId !== undefined ? { shipperId } : {}),
        ...(expectedDate !== undefined
          ? { expectedDate: expectedDate ? new Date(expectedDate) : null }
          : {}),
      },
      include: { lines: true, supplier: true },
    });
    res.json(po);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.purchaseOrder.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

// Receive a PO: create Receipt, bump receivedQty on PO lines, and add Inventory
router.post(
  '/:id/receive',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const poId = req.params.id;
    const { lines, locationId } = req.body as {
      lines: { itemId: string; qty: number; lot?: string; condition?: string }[];
      locationId?: string;
    };
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { lines: true },
    });
    if (!po) {
      res.status(404).json({ error: '발주를 찾을 수 없습니다.' });
      return;
    }
    const receivedBy = req.user?.name || req.user?.id || 'system';
    const recvLines = Array.isArray(lines) ? lines : [];

    const result = await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.create({
        data: {
          poId,
          receivedBy,
          lines: {
            create: recvLines.map((l) => ({
              itemId: l.itemId,
              qty: l.qty ?? 0,
              lot: l.lot ?? null,
              condition: l.condition ?? 'GOOD',
            })),
          },
        },
        include: { lines: true },
      });

      for (const l of recvLines) {
        // bump received qty on matching PO line
        const poLine = po.lines.find((pl) => pl.itemId === l.itemId);
        if (poLine) {
          await tx.pOLine.update({
            where: { id: poLine.id },
            data: { receivedQty: { increment: l.qty ?? 0 } },
          });
        }
        // add/update inventory
        if (locationId) {
          const existing = await tx.inventory.findFirst({
            where: { locationId, itemId: l.itemId, lot: l.lot ?? null },
          });
          if (existing) {
            await tx.inventory.update({
              where: { id: existing.id },
              data: { qty: { increment: l.qty ?? 0 } },
            });
          } else {
            await tx.inventory.create({
              data: {
                locationId,
                itemId: l.itemId,
                shipperId: po.shipperId ?? null,
                qty: l.qty ?? 0,
                lot: l.lot ?? null,
              },
            });
          }
        }
      }

      // mark PO received/partial
      const refreshed = await tx.pOLine.findMany({ where: { poId } });
      const allReceived = refreshed.every((pl) => pl.receivedQty >= pl.orderedQty);
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: allReceived ? 'RECEIVED' : 'PARTIAL' },
      });

      return receipt;
    });

    emitEvent('inbound:received', { poId, receiptId: result.id });
    res.status(201).json(result);
  })
);

export default router;
