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
        { sku: { contains: search } },
        { name: { contains: search } },
        { barcode: { contains: search } },
        { category: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: { shipper: true },
        skip,
        take: limit,
        orderBy: { sku: 'asc' },
      }),
      prisma.item.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
      include: { shipper: true, inventory: { include: { location: true } } },
    });
    if (!item) {
      res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
      return;
    }
    res.json(item);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const b = req.body;
    const item = await prisma.item.create({
      data: {
        sku: b.sku,
        barcode: b.barcode ?? null,
        name: b.name,
        category: b.category,
        uom: b.uom,
        weight: b.weight ?? null,
        length: b.length ?? null,
        width: b.width ?? null,
        height: b.height ?? null,
        reorderPoint: b.reorderPoint ?? 0,
        supplierId: b.supplierId ?? null,
        shipperId: b.shipperId ?? null,
      },
    });
    res.status(201).json(item);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const b = req.body;
    const fields = [
      'sku', 'barcode', 'name', 'category', 'uom', 'weight',
      'length', 'width', 'height', 'reorderPoint', 'supplierId', 'shipperId',
    ];
    const data: any = {};
    for (const f of fields) {
      if (b[f] !== undefined) data[f] = b[f];
    }
    const item = await prisma.item.update({ where: { id: req.params.id }, data });
    res.json(item);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.item.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
