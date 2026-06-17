import { Router, Response } from 'express';
import prisma from '../db';
import { asyncHandler } from '../util/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role === 'RIDER') {
      const [totalApplications, acceptedCount, pendingCount, reviewAvg] = await Promise.all([
        prisma.application.count({ where: { riderId: req.user!.id } }),
        prisma.application.count({ where: { riderId: req.user!.id, status: 'ACCEPTED' } }),
        prisma.application.count({ where: { riderId: req.user!.id, status: 'PENDING' } }),
        prisma.review.aggregate({ where: { targetId: req.user!.id }, _avg: { rating: true } }),
      ]);
      res.json({ totalApplications, acceptedCount, pendingCount, reviewAvg: reviewAvg._avg.rating || 0 });
    } else {
      const [totalPostings, activePostings, totalApplications, pendingApplications] = await Promise.all([
        prisma.jobPosting.count({ where: { companyId: req.user!.id } }),
        prisma.jobPosting.count({ where: { companyId: req.user!.id, status: 'OPEN' } }),
        prisma.application.count({ where: { job: { companyId: req.user!.id } } }),
        prisma.application.count({ where: { job: { companyId: req.user!.id }, status: 'PENDING' } }),
      ]);
      res.json({ totalPostings, activePostings, totalApplications, pendingApplications });
    }
  })
);

export default router;
