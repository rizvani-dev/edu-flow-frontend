import { useEffect } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

let sharedSocket = null;
let sharedSocketUserId = null;
let subscriberCount = 0;

const getOrCreateSocket = () => {
  if (sharedSocket) {
    return sharedSocket;
  }

  sharedSocket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
  });

  sharedSocket.on('connect', () => {
    if (sharedSocketUserId) {
      sharedSocket.emit('join', { userId: sharedSocketUserId });
    }
  });

  return sharedSocket;
};

const useSocket = (userId) => {
  const socket = userId ? getOrCreateSocket() : null;

  useEffect(() => {
    if (!userId) {
      return;
    }

    subscriberCount += 1;
    sharedSocketUserId = userId;

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('join', { userId });
    }

    return () => {
      subscriberCount = Math.max(0, subscriberCount - 1);

      if (subscriberCount === 0 && sharedSocket?.connected) {
        sharedSocket.emit('leaveUser');
        sharedSocket.disconnect();
        sharedSocket = null;
        sharedSocketUserId = null;
      }
    };
  }, [socket, userId]);

  return socket;
};

export default useSocket;
