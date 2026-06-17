import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import path from 'path';

import { auth } from './middleware/auth';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import reviewRoutes from './routes/reviews';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '5mb' }));

// Public
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);

// Protected
app.use('/api/jobs', auth, jobRoutes);
app.use('/api/applications', auth, applicationRoutes);
app.use('/api/reviews', auth, reviewRoutes);
app.use('/api/notifications', auth, notificationRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);

// Serve frontend static files in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// All non-API routes → frontend
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '4000', 10);
server.listen(PORT, () => {
  console.log(`[server] Card delivery platform backend listening on port ${PORT}`);
});

export { app, server };
