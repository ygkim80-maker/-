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

// Carriers
router.get(
  '/carriers',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const carriers = await prisma.carrier.findMany({ orderBy: { name: 'asc' } });
    res.json({ data: carriers, total: carriers.length });
  })
);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = pagination(req);
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const where: any = {};
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { so: { orderNumber: { contains: search } } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: { carrier: true, so: { include: { channel: true } } },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.shipment.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: { carrier: true, so: { include: { lines: true, channel: true } } },
    });
    if (!shipment) {
      res.status(404).json({ error: '배송을 찾을 수 없습니다.' });
      return;
    }
    res.json(shipment);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { soId, carrierId, trackingNumber, status, weight, shippingFee } = req.body;
    const shipment = await prisma.shipment.create({
      data: {
        soId,
        carrierId,
        trackingNumber: trackingNumber ?? null,
        status: status ?? 'PENDING',
        weight: weight ?? null,
        shippingFee: shippingFee ?? null,
      },
      include: { carrier: true, so: true },
    });
    res.status(201).json(shipment);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { carrierId, trackingNumber, status, weight, shippingFee } = req.body;
    const shipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: {
        ...(carrierId !== undefined ? { carrierId } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(weight !== undefined ? { weight } : {}),
        ...(shippingFee !== undefined ? { shippingFee } : {}),
      },
      include: { carrier: true, so: true },
    });
    res.json(shipment);
  })
);

router.put(
  '/:id/status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body as { status: string };
    const data: any = { status };
    if (status === 'SHIPPED') data.shippedAt = new Date();
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    const shipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data,
      include: { carrier: true, so: true },
    });
    emitEvent('shipment:updated', { id: shipment.id, status: shipment.status });
    res.json(shipment);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.shipment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
