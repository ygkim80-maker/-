import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { asyncHandler } from '../util/asyncHandler';
import { auth, AuthRequest, JWT_SECRET } from '../middleware/auth';

const router = Router();

// POST /register
router.post(
  '/register',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, name, phone, role } = req.body || {};
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: '이메일, 비밀번호, 이름, 역할을 입력하세요.' });
      return;
    }
    if (!['RIDER', 'COMPANY'].includes(role)) {
      res.status(400).json({ error: '역할은 RIDER 또는 COMPANY만 가능합니다.' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, phone, role },
    });
    const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: payload });
  })
);

// POST /login
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
    const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  })
);

// GET /me
router.get(
  '/me',
  auth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }
    const { password, ...profile } = user;
    res.json(profile);
  })
);

// PUT /me
router.put(
  '/me',
  auth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, phone, bio, profileImage, vehicleType, experience, regions, companyName, businessNumber, companyAddress } = req.body || {};
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(profileImage !== undefined && { profileImage }),
        ...(vehicleType !== undefined && { vehicleType }),
        ...(experience !== undefined && { experience }),
        ...(regions !== undefined && { regions }),
        ...(companyName !== undefined && { companyName }),
        ...(businessNumber !== undefined && { businessNumber }),
        ...(companyAddress !== undefined && { companyAddress }),
      },
    });
    const { password, ...profile } = user;
    res.json(profile);
  })
);

export default router;
