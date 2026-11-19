import { io } from 'socket.io-client';

// Connect to the Express & Socket.io backend (port 8080 by default, or VITE_API_URL)
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Simple continuous connection using Socket.io (just like in Week7)
export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});
