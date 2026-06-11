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
    const search = (req.query.search as string) || '';
    const where: any = {};
    if (search) {
      where.OR = [
        { item: { sku: { contains: search } } },
        { item: { name: { contains: search } } },
        { location: { code: { contains: search } } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: { item: true, location: { include: { zone: true } } },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventory.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const inv = await prisma.inventory.findUnique({
      where: { id: req.params.id },
      include: { item: true, location: { include: { zone: true } } },
    });
    if (!inv) {
      res.status(404).json({ error: '재고를 찾을 수 없습니다.' });
      return;
    }
    res.json(inv);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { locationId, itemId, shipperId, qty, lot, expiryDate } = req.body;
    const inv = await prisma.inventory.create({
      data: {
        locationId,
        itemId,
        shipperId: shipperId ?? null,
        qty: qty ?? 0,
        lot: lot ?? null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });
    res.status(201).json(inv);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { locationId, itemId, shipperId, qty, lot, expiryDate } = req.body;
    const inv = await prisma.inventory.update({
      where: { id: req.params.id },
      data: {
        ...(locationId !== undefined ? { locationId } : {}),
        ...(itemId !== undefined ? { itemId } : {}),
        ...(shipperId !== undefined ? { shipperId } : {}),
        ...(qty !== undefined ? { qty } : {}),
        ...(lot !== undefined ? { lot } : {}),
        ...(expiryDate !== undefined ? { expiryDate: expiryDate ? new Date(expiryDate) : null } : {}),
      },
    });
    res.json(inv);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.inventory.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
