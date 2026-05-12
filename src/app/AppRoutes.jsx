import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PageLoader from '../components/common/PageLoader';

// Lazy load components for better performance
const Login = lazy(() => import('../pages/Login'));
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const TeacherDashboard = lazy(() => import('../pages/Teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../pages/Student/StudentDashboard'));
const TeacherDetailsPage = lazy(() => import('../pages/Admin/TeacherDetailsPage'));
const SuperAdminDashboard = lazy(() => import('../superAdmin/SuperAdminDashboard'));

// Loading component
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
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
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
