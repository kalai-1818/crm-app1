import { io, Socket } from 'socket.io-client';
import { authService } from './authService.ts';
import { getApiOrigin } from './apiClient.ts';

let socket: Socket | null = null;

export const socketService = {
  async connect() {
    if (socket?.connected) return socket;
    const token = await authService.getToken();
    socket = io(getApiOrigin(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    return socket;
  },

  getSocket() {
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};
