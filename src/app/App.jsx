import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import AppRoutes from './AppRoutes';
import ErrorBoundary from '../components/ErrorBoundary';
import PushNotificationBridge from '../components/notifications/PushNotificationBridge';
import { useAuth } from '../context/useAuth';
import { purgeExpiredCache } from '../utils/localStorageCache';

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    purgeExpiredCache(7);
  }, []);

  return (
    <ErrorBoundary>
      <AppRoutes />
      {user ? (
        <>
          <PushNotificationBridge />
          <button
            type="button"
            className="ai-fab"
            onClick={() => navigate('/ai-assistant', { state: { fromPath: location.pathname } })}
            title="Open Edu Flow AI"
          >
            <FaRobot size={24} />
          </button>
        </>
      ) : null}
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        containerStyle={{
          zIndex: 999999, // Elevated z-index to appear above modals and system overlays
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            borderRadius: '12px',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.14)',
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
