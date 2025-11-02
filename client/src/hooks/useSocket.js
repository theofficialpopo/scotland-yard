import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Warn if VITE_SOCKET_URL is not set in production
if (import.meta.env.MODE === 'production' && !import.meta.env.VITE_SOCKET_URL) {
  console.warn(
    '⚠️ VITE_SOCKET_URL is not set in production! Falling back to localhost:3001 which will not work in production. ' +
    'Please set VITE_SOCKET_URL in your .env file.'
  );
}

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server:', socketInstance.id);
      setConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError(`Connection failed: ${err.message}`);
      setConnected(false);
    });

    socketInstance.on('error', (errorData) => {
      console.error('Socket error:', errorData);
      setError(errorData.message || 'An error occurred');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }, [socket, connected]);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  }, [socket]);

  return {
    socket,
    connected,
    error,
    emit,
    on
  };
}
