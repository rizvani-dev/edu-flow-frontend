import { useEffect, useRef } from 'react';
import useSocket from '../../hooks/useSocket';
import { useAuth } from '../../context/useAuth';

const PushNotificationBridge = () => {
  const { user } = useAuth();
  const socket = useSocket(user?.id);
  const shownIdsRef = useRef(new Set());

  useEffect(() => {
    if (!user || typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user || typeof window === 'undefined' || !('Notification' in window)) return;

    const handleNewNotification = (notification) => {
      if (!notification?.id || document.visibilityState === 'visible') return;
      if (Notification.permission !== 'granted') return;
      if (shownIdsRef.current.has(notification.id)) return;

      shownIdsRef.current.add(notification.id);

      const browserNotification = new Notification(notification.title || 'Edu Flow', {
        body: notification.message || 'You have a new update.',
        tag: `eduflow-${notification.id}`,
        silent: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, user]);

  return null;
};

export default PushNotificationBridge;
