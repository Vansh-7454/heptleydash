import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

let socketInstance: Socket | null = null;

const getSocketServerUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
  if (typeof window !== 'undefined' && window.location.hostname) {
    const protocol = window.location.protocol || 'http:';
    const host = window.location.hostname;
    return `${protocol}//${host}:5000`;
  }
  return 'http://localhost:5000';
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const connectSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;

  const token = getToken();
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  // Reuse existing connected socket
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(getSocketServerUrl(), {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socketInstance.on('connect', () => {
    console.log('[Socket.IO Client] Connected to real-time server:', socketInstance?.id);
  });

  socketInstance.on('connect_error', (err) => {
    console.warn('[Socket.IO Client] Connection warning/error:', err.message);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[Socket.IO Client] Disconnected:', reason);
  });

  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    console.log('[Socket.IO Client] Cleanly disconnected');
  }
};
