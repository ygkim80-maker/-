import { Router, Response } from 'express';
import prisma from '../db';
import { asyncHandler } from '../util/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// POST / - create review
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { targetId, jobId, rating, comment } = req.body;
    if (!targetId || !rating) {
      res.status(400).json({ error: '대상 사용자와 평점을 입력하세요.' });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: '평점은 1~5 사이여야 합니다.' });
      return;
    }
    if (targetId === req.user!.id) {
      res.status(400).json({ error: '자기 자신에게 리뷰를 작성할 수 없습니다.' });
      return;
    }
    const review = await prisma.review.create({
      data: {
        authorId: req.user!.id,
        targetId,
        jobId,
        rating,
        comment,
      },
    });
    res.status(201).json(review);
  })
);

// GET /user/:userId - get reviews for a user
router.get(
  '/user/:userId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const reviews = await prisma.review.findMany({
      where: { targetId: req.params.userId },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const avg = await prisma.review.aggregate({
      where: { targetId: req.params.userId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    res.json({ reviews, averageRating: avg._avg.rating || 0, totalReviews: avg._count.rating });
  })
);

export default router;
