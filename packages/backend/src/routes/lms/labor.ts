import { Router, Response } from 'express';
import prisma from '../../db';
import { asyncHandler } from '../../util/asyncHandler';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

const WORKER_ROLES = ['WMS_OP', 'WORKER', 'PICKER', 'PACKER', 'OPERATOR'];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Workers (users with operational roles)
router.get(
  '/workers',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const search = (req.query.search as string) || '';
    const where: any = { role: { in: WORKER_ROLES } };
    if (search) {
      where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    }
    const workers = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, shipperId: true },
      orderBy: { name: 'asc' },
    });
    res.json({ data: workers, total: workers.length });
  })
);

// Aggregated productivity
router.get(
  '/productivity',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const since = req.query.since ? new Date(req.query.since as string) : startOfToday();
    const logs = await prisma.productivityLog.findMany({
      where: { date: { gte: since } },
      include: { worker: true },
    });

    const byWorker = new Map<string, { workerId: string; name: string; quantity: number; duration: number; tasks: number }>();
    for (const log of logs) {
      const cur = byWorker.get(log.workerId) || {
        workerId: log.workerId,
        name: log.worker.name,
        quantity: 0,
        duration: 0,
        tasks: 0,
      };
      cur.quantity += log.quantity;
      cur.duration += log.duration;
      cur.tasks += 1;
      byWorker.set(log.workerId, cur);
    }

    const data = Array.from(byWorker.values()).sort((a, b) => b.quantity - a.quantity);
    const totalQty = data.reduce((s, w) => s + w.quantity, 0);
    res.json({ data, total: data.length, totalQuantity: totalQty });
  })
);

// Schedules
router.get(
  '/schedules',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const where: any = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }
    const schedules = await prisma.workerSchedule.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json({ data: schedules, total: schedules.length });
  })
);

// Create a productivity log
router.post(
  '/productivity',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { workerId, taskType, quantity, duration, date } = req.body;
    const log = await prisma.productivityLog.create({
      data: {
        workerId: workerId || req.user?.id || '',
        taskType: taskType ?? 'PICK',
        quantity: quantity ?? 0,
        duration: duration ?? 0,
        ...(date ? { date: new Date(date) } : {}),
      },
    });
    res.status(201).json(log);
  })
);

export default router;
