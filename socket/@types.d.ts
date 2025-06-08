import http from 'http';
import { Server as SocketServer } from 'socket.io';

/**
 * Initialize socket.io and attach to an HTTP server
 * @param server HTTP server (http.createServer(...))
 * @returns instance of Socket.IO server
 */
export function initSocketServer(server: http.Server): SocketServer;
