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
        { code: { contains: search } },
        { aisle: { contains: search } },
        { locationType: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: { zone: true },
        skip,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      prisma.location.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const loc = await prisma.location.findUnique({
      where: { id: req.params.id },
      include: { zone: true, inventory: { include: { item: true } } },
    });
    if (!loc) {
      res.status(404).json({ error: '로케이션을 찾을 수 없습니다.' });
      return;
    }
    res.json(loc);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { zoneId, code, aisle, bay, level, position, locationType, capacity, isActive } = req.body;
    const loc = await prisma.location.create({
      data: {
        zoneId,
        code,
        aisle,
        bay,
        level,
        position,
        locationType,
        capacity: capacity ?? 0,
        isActive: isActive ?? true,
      },
    });
    res.status(201).json(loc);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { zoneId, code, aisle, bay, level, position, locationType, capacity, isActive } = req.body;
    const loc = await prisma.location.update({
      where: { id: req.params.id },
      data: {
        ...(zoneId !== undefined ? { zoneId } : {}),
        ...(code !== undefined ? { code } : {}),
        ...(aisle !== undefined ? { aisle } : {}),
        ...(bay !== undefined ? { bay } : {}),
        ...(level !== undefined ? { level } : {}),
        ...(position !== undefined ? { position } : {}),
        ...(locationType !== undefined ? { locationType } : {}),
        ...(capacity !== undefined ? { capacity } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    res.json(loc);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
