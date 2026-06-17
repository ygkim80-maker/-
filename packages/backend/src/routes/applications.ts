import { Router, Response } from 'express';
import prisma from '../db';
import { asyncHandler } from '../util/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// POST / - rider applies to job
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'RIDER') {
      res.status(403).json({ error: '라이더 계정만 지원할 수 있습니다.' });
      return;
    }
    const { jobId, message } = req.body;
    if (!jobId) {
      res.status(400).json({ error: 'jobId를 입력하세요.' });
      return;
    }
    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'OPEN') {
      res.status(400).json({ error: '지원할 수 없는 공고입니다.' });
      return;
    }
    const existing = await prisma.application.findUnique({
      where: { jobId_riderId: { jobId, riderId: req.user!.id } },
    });
    if (existing) {
      res.status(409).json({ error: '이미 지원한 공고입니다.' });
      return;
    }
    const application = await prisma.application.create({
      data: { jobId, riderId: req.user!.id, message },
    });
    // Create notification for company
    await prisma.notification.create({
      data: {
        userId: job.companyId,
        title: '새로운 지원',
        message: `${req.user!.name}님이 "${job.title}" 공고에 지원했습니다.`,
        type: 'APPLICATION',
      },
    });
    res.status(201).json(application);
  })
);

// GET /my - rider's applications or company's received applications
router.get(
  '/my',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role === 'RIDER') {
      const applications = await prisma.application.findMany({
        where: { riderId: req.user!.id },
        include: {
          job: {
            include: { company: { select: { id: true, name: true, companyName: true } } },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });
      res.json(applications);
    } else {
      const applications = await prisma.application.findMany({
        where: { job: { companyId: req.user!.id } },
        include: {
          job: { select: { id: true, title: true, region: true, cardType: true } },
          rider: { select: { id: true, name: true, phone: true, vehicleType: true, experience: true, regions: true } },
        },
        orderBy: { appliedAt: 'desc' },
      });
      res.json(applications);
    }
  })
);

// PUT /:id/status - company accepts/rejects
router.put(
  '/:id/status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'COMPANY') {
      res.status(403).json({ error: '업체 계정만 지원 상태를 변경할 수 있습니다.' });
      return;
    }
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'status는 ACCEPTED 또는 REJECTED만 가능합니다.' });
      return;
    }
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!application) {
      res.status(404).json({ error: '지원 내역을 찾을 수 없습니다.' });
      return;
    }
    if (application.job.companyId !== req.user!.id) {
      res.status(403).json({ error: '본인의 공고에 대한 지원만 처리할 수 있습니다.' });
      return;
    }
    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status, respondedAt: new Date() },
    });
    // Notify rider
    await prisma.notification.create({
      data: {
        userId: application.riderId,
        title: status === 'ACCEPTED' ? '지원 수락' : '지원 거절',
        message: `"${application.job.title}" 공고 지원이 ${status === 'ACCEPTED' ? '수락' : '거절'}되었습니다.`,
        type: status,
      },
    });
    res.json(updated);
  })
);

// DELETE /:id - rider cancels application
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const application = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!application) {
      res.status(404).json({ error: '지원 내역을 찾을 수 없습니다.' });
      return;
    }
    if (application.riderId !== req.user!.id) {
      res.status(403).json({ error: '본인의 지원만 취소할 수 있습니다.' });
      return;
    }
    if (application.status !== 'PENDING') {
      res.status(400).json({ error: '대기 중인 지원만 취소할 수 있습니다.' });
      return;
    }
    await prisma.application.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    res.json({ message: '지원이 취소되었습니다.' });
  })
);

export default router;
