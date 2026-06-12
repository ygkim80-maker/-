import { Router, Response } from 'express';
import prisma from '../../db';
import { asyncHandler } from '../../util/asyncHandler';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

// Resolve the shipper scope: SHIPPER role is locked to its own shipperId,
// other roles may pass ?shipperId= to inspect a specific shipper.
function resolveShipperId(req: AuthRequest): string | null {
  if (req.user?.role === 'SHIPPER') return req.user.shipperId ?? null;
  return (req.query.shipperId as string) || null;
}

router.get(
  '/inventory',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const shipperId = resolveShipperId(req);
    const where: any = {};
    if (shipperId) where.shipperId = shipperId;
    const data = await prisma.inventory.findMany({
      where,
      include: { item: true, location: { include: { zone: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ data, total: data.length });
  })
);

router.get(
  '/orders',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const shipperId = resolveShipperId(req);
    const status = (req.query.status as string) || '';
    const where: any = {};
    if (shipperId) where.shipperId = shipperId;
    if (status) where.status = status;
    const data = await prisma.salesOrder.findMany({
      where,
      include: { channel: true, lines: { include: { item: true } }, shipment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data, total: data.length });
  })
);

router.get(
  '/purchase-orders',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const shipperId = resolveShipperId(req);
    const where: any = {};
    if (shipperId) where.shipperId = shipperId;
    const data = await prisma.purchaseOrder.findMany({
      where,
      include: { supplier: true, lines: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data, total: data.length });
  })
);

// Summary KPIs scoped to the shipper
router.get(
  '/summary',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const shipperId = resolveShipperId(req);
    const invWhere: any = {};
    const soWhere: any = {};
    const poWhere: any = {};
    if (shipperId) {
      invWhere.shipperId = shipperId;
      soWhere.shipperId = shipperId;
      poWhere.shipperId = shipperId;
    }

    const [inventoryItems, totalOrders, pendingPOs, inventoryAgg] = await Promise.all([
      prisma.inventory.count({ where: invWhere }),
      prisma.salesOrder.count({ where: soWhere }),
      prisma.purchaseOrder.count({
        where: { ...poWhere, status: { in: ['PENDING', 'OPEN', 'CONFIRMED', 'PARTIAL'] } },
      }),
      prisma.inventory.aggregate({ where: invWhere, _sum: { qty: true } }),
    ]);

    res.json({
      shipperId,
      inventoryItems,
      totalQty: inventoryAgg._sum.qty ?? 0,
      totalOrders,
      pendingPOs,
    });
  })
);

export default router;
