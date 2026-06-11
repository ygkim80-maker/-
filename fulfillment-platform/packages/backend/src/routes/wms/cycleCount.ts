import { Router, Response } from 'express';
import prisma from '../../db';
import { asyncHandler } from '../../util/asyncHandler';
import { AuthRequest } from '../../middleware/auth';

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
    const status = (req.query.status as string) || '';
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.cycleCount.findMany({
        where,
        include: { location: { include: { zone: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cycleCount.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const cc = await prisma.cycleCount.findUnique({
      where: { id: req.params.id },
      include: { location: { include: { zone: true } } },
    });
    if (!cc) {
      res.status(404).json({ error: '재고 실사를 찾을 수 없습니다.' });
      return;
    }
    res.json(cc);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { locationId, itemId, systemQty, status } = req.body;
    const cc = await prisma.cycleCount.create({
      data: {
        locationId,
        itemId: itemId ?? null,
        systemQty: systemQty ?? 0,
        status: status ?? 'PENDING',
      },
    });
    res.status(201).json(cc);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { systemQty, countedQty, status } = req.body;
    const cc = await prisma.cycleCount.update({
      where: { id: req.params.id },
      data: {
        ...(systemQty !== undefined ? { systemQty } : {}),
        ...(countedQty !== undefined ? { countedQty } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });
    res.json(cc);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.cycleCount.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

// Submit count
router.post(
  '/:id/submit',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { countedQty } = req.body as { countedQty: number };
    const cc = await prisma.cycleCount.update({
      where: { id: req.params.id },
      data: {
        countedQty: countedQty ?? 0,
        status: 'COMPLETED',
        countedBy: req.user?.name || req.user?.id || 'system',
        countedAt: new Date(),
      },
    });
    res.json(cc);
  })
);

export default router;
