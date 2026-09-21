import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleRedirect from '../components/auth/RoleRedirect';
import PageLoader from '../components/common/PageLoader';

// Lazy load components for better performance
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Login = lazy(() => import('../pages/Login'));
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const TeacherDashboard = lazy(() => import('../pages/Teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../pages/Student/StudentDashboard'));
const TeacherDetailsPage = lazy(() => import('../pages/Admin/TeacherDetailsPage'));
const StudentExam = lazy(() => import('../pages/Student/StudentExam'));
const TeacherExamResults = lazy(() => import('../pages/Teacher/TeacherExamResults'));
const SuperAdminDashboard = lazy(() => import('../superAdmin/SuperAdminDashboard'));
const AiAssistantPage = lazy(() => import('../pages/AiAssistantPage'));
const AttendancePage = lazy(() => import('../pages/Attendance/AttendancePage'));

// Loading component
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/teacher/:teacherId" element={<TeacherDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/exams/:examId" element={<TeacherExamResults />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exams/:examId" element={<StudentExam />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student']} />}>
          <Route path="/ai-assistant" element={<AiAssistantPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
        </Route>

        <Route path="/dashboard" element={<RoleRedirect fallback="/" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
