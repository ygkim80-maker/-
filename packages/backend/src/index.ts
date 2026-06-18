import 'dotenv/config';
// v1.1.0
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

import { auth } from './middleware/auth';
import { errorHandler, notFound } from './middleware/errorHandler';
import { initSocket } from './services/socketService';

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import inventoryRoutes from './routes/wms/inventory';
import locationsRoutes from './routes/wms/locations';
import itemsRoutes from './routes/wms/items';
import inboundRoutes from './routes/wms/inbound';
import outboundRoutes from './routes/wms/outbound';
import cycleCountRoutes from './routes/wms/cycleCount';
import ordersRoutes from './routes/oms/orders';
import shipmentsRoutes from './routes/tms/shipments';
import dockRoutes from './routes/yms/dock';
import laborRoutes from './routes/lms/labor';
import portalRoutes from './routes/shipper/portal';
import chatRoutes from './routes/ai/chat';
import monitoringRoutes from './routes/monitoring/monitoring';
import stockRoutes from './routes/stock/stock';

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
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/wms/inventory', auth, inventoryRoutes);
app.use('/api/wms/locations', auth, locationsRoutes);
app.use('/api/wms/items', auth, itemsRoutes);
app.use('/api/wms/inbound', auth, inboundRoutes);
app.use('/api/wms/outbound', auth, outboundRoutes);
app.use('/api/wms/cycle-count', auth, cycleCountRoutes);
app.use('/api/oms/orders', auth, ordersRoutes);
app.use('/api/tms/shipments', auth, shipmentsRoutes);
app.use('/api/yms/dock', auth, dockRoutes);
app.use('/api/lms/labor', auth, laborRoutes);
app.use('/api/shipper/portal', auth, portalRoutes);
app.use('/api/ai/chat', auth, chatRoutes);
app.use('/api/monitoring', auth, monitoringRoutes);
app.use('/api/stock', auth, stockRoutes);

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
const io = new Server(server, {
  cors: { origin: '*' },
});
initSocket(io);

const PORT = parseInt(process.env.PORT || '4000', 10);
server.listen(PORT, () => {
  console.log(`[server] Fulfillment backend listening on port ${PORT}`);
});

export { app, server, io };
// deploy trigger Mon Jun 15 07:00:53 UTC 2026
