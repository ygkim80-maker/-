import { Server } from 'socket.io';

export let io: Server | undefined;

export function setIo(server: Server): void {
  io = server;
}

export function initSocket(server: Server): void {
  setIo(server);
  server.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });
}

export function emitEvent(event: string, payload: any): void {
  if (io) {
    io.emit(event, payload);
  }
}

export function emitAlert(alert: any): void {
  emitEvent('alert:new', alert);
}

export default { initSocket, setIo, emitEvent, emitAlert };
