import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function initSocket(userId: string): Socket {
  if (socketInstance) {
    socketInstance.disconnect();
  }
  
  socketInstance = io(window.location.origin, {
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    autoConnect: true,
    timeout: 10000,
    auth: { userId }
  });
  
  socketInstance.on('connect_error', () => {
    // Silently handled
  });
  
  socketInstance.on('connect_timeout', () => {
    // Silently handled
  });
  
  return socketInstance;
}

export function getSocket(): Socket {
  if (!socketInstance) {
    // fallback for imports that just call getSocket() before init
    return initSocket('anonymous');
  }
  return socketInstance;
}

