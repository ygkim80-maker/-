import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { asyncHandler } from '../util/asyncHandler';
import { auth, AuthRequest, JWT_SECRET } from '../middleware/auth';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: '이메일과 비밀번호를 입력하세요.' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: '인증 정보가 올바르지 않습니다.' });
      return;
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401).json({ error: '인증 정보가 올바르지 않습니다.' });
      return;
    }
    const payload = {
      id: user.id,
      role: user.role,
      shipperId: user.shipperId,
      email: user.email,
      name: user.name,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      shipperId: user.shipperId,
    });
  })
);

export default router;
