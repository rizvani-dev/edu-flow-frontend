import AttendanceSection from '../../components/Attendance/AttendanceSection';
import PageLoader from '../../components/common/PageLoader';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const AttendancePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <PageLoader />;

  return (
    <div className="dashboard-shell attendance-page">
      <div className="attendance-page-nav">
        <button onClick={() => navigate(-1)} className="btn-ui-secondary">
          <FaHome /> Back to Dashboard
        </button>
      </div>
      <div className="dashboard-panel">
        <AttendanceSection 
          teacher={user.role === 'teacher' ? user : null} 
          student={user.role === 'student' ? user : null}
        />
      </div>
    </div>
  );
};

export default AttendancePage;
