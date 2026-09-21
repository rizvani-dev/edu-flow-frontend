export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case 'super_admin':
      return '/superadmin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/login';
  }
};
