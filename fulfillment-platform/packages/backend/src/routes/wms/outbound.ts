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

// ---- Waves ----
router.get(
  '/waves',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = pagination(req);
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const where: any = {};
    if (search) where.waveNumber = { contains: search };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.wave.findMany({
        where,
        include: { orders: true, pickTasks: true },
        skip,
        take: limit,
        orderBy: { plannedAt: 'desc' },
      }),
      prisma.wave.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/waves/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const wave = await prisma.wave.findUnique({
      where: { id: req.params.id },
      include: {
        orders: { include: { lines: true } },
        pickTasks: { include: { item: true, location: true } },
      },
    });
    if (!wave) {
      res.status(404).json({ error: '웨이브를 찾을 수 없습니다.' });
      return;
    }
    res.json(wave);
  })
);

router.post(
  '/waves',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { waveNumber, waveType, status, orderIds } = req.body as {
      waveNumber?: string;
      waveType?: string;
      status?: string;
      orderIds?: string[];
    };
    const number = waveNumber || `WAVE-${Date.now()}`;

    const wave = await prisma.wave.create({
      data: {
        waveNumber: number,
        waveType: waveType ?? 'STANDARD',
        status: status ?? 'PLANNED',
        orders:
          Array.isArray(orderIds) && orderIds.length > 0
            ? { connect: orderIds.map((id) => ({ id })) }
            : undefined,
      },
      include: { orders: true },
    });

    // generate pick tasks from SO lines of attached orders
    if (Array.isArray(orderIds) && orderIds.length > 0) {
      const soLines = await prisma.sOLine.findMany({
        where: { soId: { in: orderIds } },
      });
      for (const line of soLines) {
        const inv = await prisma.inventory.findFirst({
          where: { itemId: line.itemId, qty: { gt: 0 } },
        });
        await prisma.pickTask.create({
          data: {
            waveId: wave.id,
            soId: line.soId,
            locationId: inv?.locationId ?? '',
            itemId: line.itemId,
            qty: line.orderedQty,
            status: 'PENDING',
          },
        });
      }
    }

    emitEvent('wave:created', { id: wave.id, waveNumber: wave.waveNumber });
    res.status(201).json(wave);
  })
);

// ---- Pick tasks ----
router.get(
  '/pick-tasks',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = pagination(req);
    const status = (req.query.status as string) || '';
    const waveId = (req.query.waveId as string) || '';
    const where: any = {};
    if (status) where.status = status;
    if (waveId) where.waveId = waveId;

    const [data, total] = await Promise.all([
      prisma.pickTask.findMany({
        where,
        include: { item: true, location: true, so: true, worker: true },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.pickTask.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.post(
  '/pick-tasks/:id/complete',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { pickedQty } = req.body as { pickedQty?: number };
    const task = await prisma.pickTask.findUnique({ where: { id: req.params.id } });
    if (!task) {
      res.status(404).json({ error: '피킹 작업을 찾을 수 없습니다.' });
      return;
    }
    const picked = pickedQty ?? task.qty;

    const updated = await prisma.$transaction(async (tx) => {
      const t = await tx.pickTask.update({
        where: { id: task.id },
        data: {
          pickedQty: picked,
          status: 'COMPLETED',
          completedAt: new Date(),
          assignedTo: req.user?.id ?? task.assignedTo,
        },
      });
      // decrement inventory at location
      if (task.locationId) {
        const inv = await tx.inventory.findFirst({
          where: { locationId: task.locationId, itemId: task.itemId },
        });
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { qty: { decrement: Math.min(picked, inv.qty) } },
          });
        }
      }
      // bump SO line pickedQty
      const soLine = await tx.sOLine.findFirst({
        where: { soId: task.soId, itemId: task.itemId },
      });
      if (soLine) {
        await tx.sOLine.update({
          where: { id: soLine.id },
          data: { pickedQty: { increment: picked } },
        });
      }
      return t;
    });

    emitEvent('pick:completed', { id: updated.id });
    res.json(updated);
  })
);

export default router;
