import { Router, Response } from 'express';
import prisma from '../../db';
import { asyncHandler } from '../../util/asyncHandler';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

// 센서 장치 목록
router.get('/devices', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const devices = await prisma.sensorDevice.findMany({
    include: { logs: { orderBy: { recordedAt: 'desc' }, take: 1 } },
    orderBy: { zoneCode: 'asc' },
  });
  res.json(devices);
}));

// 센서 장치 등록
router.post('/devices', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, zoneCode, location, minTemp, maxTemp, minHumidity, maxHumidity } = req.body;
  const device = await prisma.sensorDevice.create({
    data: { name, zoneCode, location, minTemp: minTemp ?? 0, maxTemp: maxTemp ?? 40, minHumidity: minHumidity ?? 20, maxHumidity: maxHumidity ?? 80 },
  });
  res.status(201).json(device);
}));

// 센서 장치 수정
router.put('/devices/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, zoneCode, location, minTemp, maxTemp, minHumidity, maxHumidity, isActive } = req.body;
  const device = await prisma.sensorDevice.update({
    where: { id: req.params.id },
    data: { ...(name !== undefined && { name }), ...(zoneCode !== undefined && { zoneCode }), ...(location !== undefined && { location }), ...(minTemp !== undefined && { minTemp }), ...(maxTemp !== undefined && { maxTemp }), ...(minHumidity !== undefined && { minHumidity }), ...(maxHumidity !== undefined && { maxHumidity }), ...(isActive !== undefined && { isActive }) },
  });
  res.json(device);
}));

// 센서 데이터 수신 (IoT 장치에서 POST)
router.post('/devices/:id/data', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { temperature, humidity } = req.body;
  const device = await prisma.sensorDevice.findUnique({ where: { id: req.params.id } });
  if (!device) { res.status(404).json({ error: '장치를 찾을 수 없습니다.' }); return; }

  const log = await prisma.sensorLog.create({
    data: { deviceId: req.params.id, temperature, humidity },
  });

  // 임계값 초과 시 알림 생성
  if (temperature > device.maxTemp || temperature < device.minTemp || humidity > device.maxHumidity || humidity < device.minHumidity) {
    await prisma.alert.create({
      data: {
        type: 'SENSOR',
        severity: 'WARNING',
        title: `온습도 이상 - ${device.name}`,
        message: `${device.location} 온도: ${temperature}°C, 습도: ${humidity}% (허용범위: ${device.minTemp}~${device.maxTemp}°C, ${device.minHumidity}~${device.maxHumidity}%)`,
      },
    });
  }

  res.json(log);
}));

// 센서 로그 조회
router.get('/devices/:id/logs', asyncHandler(async (req: AuthRequest, res: Response) => {
  const hours = parseInt((req.query.hours as string) || '24', 10);
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const logs = await prisma.sensorLog.findMany({
    where: { deviceId: req.params.id, recordedAt: { gte: since } },
    orderBy: { recordedAt: 'asc' },
  });
  res.json(logs);
}));

// CCTV 카메라 목록
router.get('/cameras', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const cameras = await prisma.cctvCamera.findMany({
    include: { alerts: { where: { isResolved: false }, orderBy: { detectedAt: 'desc' }, take: 3 } },
    orderBy: { zoneCode: 'asc' },
  });
  res.json(cameras);
}));

// CCTV 카메라 등록
router.post('/cameras', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, location, zoneCode, streamUrl } = req.body;
  const camera = await prisma.cctvCamera.create({ data: { name, location, zoneCode, streamUrl: streamUrl ?? null } });
  res.status(201).json(camera);
}));

// CCTV 카메라 수정
router.put('/cameras/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, location, zoneCode, streamUrl, isActive } = req.body;
  const camera = await prisma.cctvCamera.update({
    where: { id: req.params.id },
    data: { ...(name !== undefined && { name }), ...(location !== undefined && { location }), ...(zoneCode !== undefined && { zoneCode }), ...(streamUrl !== undefined && { streamUrl }), ...(isActive !== undefined && { isActive }) },
  });
  res.json(camera);
}));

// CCTV 알림 목록
router.get('/cameras/alerts', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const alerts = await prisma.cctvAlert.findMany({
    include: { camera: true },
    orderBy: { detectedAt: 'desc' },
    take: 50,
  });
  res.json(alerts);
}));

// CCTV 알림 등록 (AI 감지 결과 수신)
router.post('/cameras/:id/alerts', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { alertType, severity, message } = req.body;
  const alert = await prisma.cctvAlert.create({
    data: { cameraId: req.params.id, alertType, severity, message },
  });
  res.status(201).json(alert);
}));

// CCTV 알림 해제
router.put('/cameras/alerts/:id/resolve', asyncHandler(async (req: AuthRequest, res: Response) => {
  const alert = await prisma.cctvAlert.update({
    where: { id: req.params.id },
    data: { isResolved: true, resolvedAt: new Date() },
  });
  res.json(alert);
}));

export default router;
