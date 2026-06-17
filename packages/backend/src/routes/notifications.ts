import { Router, Response } from 'express';
import prisma from '../db';
import { asyncHandler } from '../util/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET / - my notifications
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  })
);

// PUT /:id/read - mark as read
router.put(
  '/:id/read',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user!.id) {
      res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
      return;
    }
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(updated);
  })
);

// PUT /read-all - mark all as read
router.put(
  '/read-all',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: '모든 알림을 읽음 처리했습니다.' });
  })
);

export default router;
