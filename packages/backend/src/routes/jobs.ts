import { Router, Response } from 'express';
import prisma from '../db';
import { asyncHandler } from '../util/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET / - list jobs with filters
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { region, cardType, payType, status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = {};
    if (region) where.region = region;
    if (cardType) where.cardType = cardType;
    if (payType) where.payType = payType;
    if (status) where.status = status;
    else where.status = 'OPEN';
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        include: { company: { select: { id: true, name: true, companyName: true, profileImage: true } }, _count: { select: { applications: true } } },
        orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: parseInt(limit),
      }),
      prisma.jobPosting.count({ where }),
    ]);
    res.json({ jobs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  })
);

// GET /:id - job detail
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const job = await prisma.jobPosting.findUnique({
      where: { id: req.params.id },
      include: {
        company: { select: { id: true, name: true, companyName: true, profileImage: true, phone: true, companyAddress: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) {
      res.status(404).json({ error: '공고를 찾을 수 없습니다.' });
      return;
    }
    res.json(job);
  })
);

// POST / - company creates job
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'COMPANY') {
      res.status(403).json({ error: '업체 계정만 공고를 등록할 수 있습니다.' });
      return;
    }
    const { title, description, cardType, region, regionDetail, dailyCount, payType, payAmount, startDate, endDate, workDays, workStartTime, workEndTime, vehicleType, isUrgent } = req.body;
    const job = await prisma.jobPosting.create({
      data: {
        companyId: req.user!.id,
        title,
        description,
        cardType,
        region,
        regionDetail,
        dailyCount,
        payType,
        payAmount,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        workDays,
        workStartTime,
        workEndTime,
        vehicleType,
        isUrgent: isUrgent || false,
      },
    });
    res.status(201).json(job);
  })
);

// PUT /:id - company updates job
router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const job = await prisma.jobPosting.findUnique({ where: { id: req.params.id } });
    if (!job) {
      res.status(404).json({ error: '공고를 찾을 수 없습니다.' });
      return;
    }
    if (job.companyId !== req.user!.id) {
      res.status(403).json({ error: '본인의 공고만 수정할 수 있습니다.' });
      return;
    }
    const { title, description, cardType, region, regionDetail, dailyCount, payType, payAmount, startDate, endDate, workDays, workStartTime, workEndTime, vehicleType, isUrgent, status } = req.body;
    const updated = await prisma.jobPosting.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(cardType !== undefined && { cardType }),
        ...(region !== undefined && { region }),
        ...(regionDetail !== undefined && { regionDetail }),
        ...(dailyCount !== undefined && { dailyCount }),
        ...(payType !== undefined && { payType }),
        ...(payAmount !== undefined && { payAmount }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(workDays !== undefined && { workDays }),
        ...(workStartTime !== undefined && { workStartTime }),
        ...(workEndTime !== undefined && { workEndTime }),
        ...(vehicleType !== undefined && { vehicleType }),
        ...(isUrgent !== undefined && { isUrgent }),
        ...(status !== undefined && { status }),
      },
    });
    res.json(updated);
  })
);

// DELETE /:id - company deletes/closes job
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const job = await prisma.jobPosting.findUnique({ where: { id: req.params.id } });
    if (!job) {
      res.status(404).json({ error: '공고를 찾을 수 없습니다.' });
      return;
    }
    if (job.companyId !== req.user!.id) {
      res.status(403).json({ error: '본인의 공고만 삭제할 수 있습니다.' });
      return;
    }
    await prisma.jobPosting.update({ where: { id: req.params.id }, data: { status: 'CLOSED' } });
    res.json({ message: '공고가 마감되었습니다.' });
  })
);

export default router;
