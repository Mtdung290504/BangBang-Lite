import http from 'http';
import { Server as SocketServer } from 'socket.io';

/**
 * Khởi tạo socket.io và gắn vào một HTTP server
 * @param server HTTP server (http.createServer(...))
 * @returns instance của Socket.IO server
 */
export function initSocket(server: http.Server): SocketServer;
