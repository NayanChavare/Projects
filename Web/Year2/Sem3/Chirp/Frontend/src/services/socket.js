import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'https://projects-ss5j.onrender.com';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection warning:', error.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
