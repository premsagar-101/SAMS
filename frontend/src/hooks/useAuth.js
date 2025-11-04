import { useAuth as useAuthContext } from '../contexts/AuthContext'

// Custom hook for authentication
export const useAuth = () => {
  const auth = useAuthContext()

  // Helper functions
  const isStudent = () => auth.user?.role === 'student'
  const isTeacher = () => auth.user?.role === 'teacher'
  const isHOD = () => auth.user?.role === 'hod'
  const isAdmin = () => auth.user?.role === 'admin'

  const canAccess = (allowedRoles) => {
    if (!auth.isAuthenticated) return false
    if (!allowedRoles || allowedRoles.length === 0) return true
    return allowedRoles.includes(auth.user?.role)
  }

  const hasPermission = (permission) => {
    if (!auth.isAuthenticated) return false

    const permissions = {
      student: ['view_own_attendance', 'scan_qr'],
      teacher: ['generate_qr', 'view_class_attendance', 'manage_attendance', 'view_timetable'],
      hod: ['view_department_attendance', 'view_teacher_reports', 'manage_department', 'override_attendance'],
      admin: ['full_access']
    }

    const rolePermissions = permissions[auth.user?.role] || []
    return rolePermissions.includes(permission) || auth.user?.role === 'admin'
  }

  const getDashboardRoute = () => {
    switch (auth.user?.role) {
      case 'student':
        return '/dashboard'
      case 'teacher':
        return '/dashboard'
      case 'hod':
        return '/dashboard'
      case 'admin':
        return '/dashboard'
      default:
        return '/dashboard'
    }
  }

  const getFullName = () => {
    if (!auth.user) return ''
    return `${auth.user.firstName} ${auth.user.lastName}`.trim()
  }

  return {
    ...auth,
    // Role helpers
    isStudent,
    isTeacher,
    isHOD,
    isAdmin,
    canAccess,
    hasPermission,
    // Route helpers
    getDashboardRoute,
    // Profile helpers
    getFullName,
  }
}