import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    try {
      socketInstance = io(window.location.origin, {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        autoConnect: true,
        timeout: 10000,
      });

      socketInstance.on('connect_error', () => {
        // Silently handled - socket.io will auto-reconnect via polling
      });

      socketInstance.on('connect_timeout', () => {
        // Silently handled
      });
    } catch {
      // Fallback
    }
  }
  return socketInstance!;
}

