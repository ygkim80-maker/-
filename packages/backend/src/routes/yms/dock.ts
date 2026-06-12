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

// Dock doors
router.get(
  '/doors',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const doors = await prisma.dockDoor.findMany({ orderBy: { doorNumber: 'asc' } });
    res.json({ data: doors, total: doors.length });
  })
);

// Appointments
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = pagination(req);
    const status = (req.query.status as string) || '';
    const search = (req.query.search as string) || '';
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { driverName: { contains: search } },
        { vehiclePlate: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.dockAppointment.findMany({
        where,
        include: { dockDoor: true, po: { include: { supplier: true } } },
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.dockAppointment.count({ where }),
    ]);
    res.json({ data, total, page, limit });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const appt = await prisma.dockAppointment.findUnique({
      where: { id: req.params.id },
      include: { dockDoor: true, po: { include: { supplier: true } } },
    });
    if (!appt) {
      res.status(404).json({ error: '도크 예약을 찾을 수 없습니다.' });
      return;
    }
    res.json(appt);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { dockDoorId, poId, type, vehiclePlate, driverName, scheduledAt, status } = req.body;
    const appt = await prisma.dockAppointment.create({
      data: {
        dockDoorId,
        poId: poId ?? null,
        type: type ?? 'INBOUND',
        vehiclePlate: vehiclePlate ?? null,
        driverName: driverName ?? null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: status ?? 'SCHEDULED',
      },
      include: { dockDoor: true },
    });
    res.status(201).json(appt);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { dockDoorId, type, vehiclePlate, driverName, scheduledAt, status } = req.body;
    const appt = await prisma.dockAppointment.update({
      where: { id: req.params.id },
      data: {
        ...(dockDoorId !== undefined ? { dockDoorId } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(vehiclePlate !== undefined ? { vehiclePlate } : {}),
        ...(driverName !== undefined ? { driverName } : {}),
        ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      include: { dockDoor: true },
    });
    res.json(appt);
  })
);

router.put(
  '/:id/status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body as { status: string };
    const data: any = { status };
    if (status === 'ARRIVED') data.arrivedAt = new Date();
    if (status === 'DEPARTED') data.departedAt = new Date();
    const appt = await prisma.dockAppointment.update({
      where: { id: req.params.id },
      data,
      include: { dockDoor: true },
    });
    emitEvent('dock:updated', { id: appt.id, status: appt.status });
    res.json(appt);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.dockAppointment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
