import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import AiAssistantModal from '../components/ai/AiAssistantModal';
import { useAuth } from '../context/useAuth';
import { CACHE_KEYS, getCache } from '../utils/localStorageCache';

const getDashboardSnapshot = (user, pathname) => {
  if (!user?.id) return null;
  if (pathname.includes('/admin/')) return getCache(CACHE_KEYS.ADMIN_DASHBOARD(`${user.school_id || 'school'}__default`)) || null;
  if (pathname.includes('/teacher/')) return getCache(CACHE_KEYS.TEACHER_DASHBOARD(user.id)) || null;
  if (pathname.includes('/student/')) return getCache(CACHE_KEYS.STUDENT_DASHBOARD(user.id)) || null;
  return null;
};

export default function AiAssistantPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const context = useMemo(() => ({
    role: user?.role || 'school_user',
    user,
    route: location.state?.fromPath || location.pathname,
    cachedDashboard: getDashboardSnapshot(user, location.state?.fromPath || ''),
  }), [location.pathname, location.state?.fromPath, user]);

  return (
    <div className="dashboard-shell" style={{ paddingTop: 24 }}>
      <div className="dashboard-toolbar">
        <button type="button" className="btn-ui-secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </div>
      <AiAssistantModal isOpen onClose={() => navigate(-1)} context={context} embedded />
    </div>
  );
}
