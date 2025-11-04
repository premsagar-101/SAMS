import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import {
  authAPI,
  academicAPI,
  timetableAPI,
  qrAPI,
  attendanceAPI,
  reportsAPI,
  notificationAPI,
  systemAPI,
} from '../services/api'

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      toast.success('Login successful!')
      queryClient.invalidateQueries('user')
    },
    onError: (error) => {
      toast.error(error.error || 'Login failed')
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      toast.success('Registration successful!')
      queryClient.invalidateQueries('user')
    },
    onError: (error) => {
      toast.error(error.error || 'Registration failed')
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      toast.success('Logged out successfully')
      queryClient.clear()
      window.location.href = '/login'
    },
    onError: () => {
      toast.error('Logout failed')
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries('user')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    },
  })
}

// Academic hooks
export const useDepartments = () => {
  return useQuery({
    queryKey: 'departments',
    queryFn: academicAPI.getDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePrograms = (departmentId) => {
  return useQuery({
    queryKey: ['programs', departmentId],
    queryFn: () => academicAPI.getPrograms(departmentId),
    staleTime: 5 * 60 * 1000,
  })
}

export const useSubjects = (params) => {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => academicAPI.getSubjects(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useSemesters = (params) => {
  return useQuery({
    queryKey: ['semesters', params],
    queryFn: () => academicAPI.getSemesters(params),
    staleTime: 5 * 60 * 1000,
  })
}

// Timetable hooks
export const useTimetable = (params) => {
  return useQuery({
    queryKey: ['timetable', params],
    queryFn: () => timetableAPI.getTimetable(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCurrentPeriods = () => {
  return useQuery({
    queryKey: 'currentPeriods',
    queryFn: timetableAPI.getCurrentPeriods,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 0,
  })
}

export const useUpcomingPeriods = (hours = 24) => {
  return useQuery({
    queryKey: ['upcomingPeriods', hours],
    queryFn: () => timetableAPI.getUpcomingPeriods(hours),
    refetchInterval: 60 * 1000, // Refetch every minute
    staleTime: 0,
  })
}

// QR hooks
export const useGenerateQR = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: qrAPI.generateQR,
    onSuccess: (data) => {
      toast.success('QR code generated successfully!')
      queryClient.invalidateQueries('currentPeriods')
      queryClient.invalidateQueries('qrSession')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to generate QR code')
    },
  })
}

export const useQRSession = (periodId) => {
  return useQuery({
    queryKey: ['qrSession', periodId],
    queryFn: () => qrAPI.getQRSession(periodId),
    enabled: !!periodId,
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    staleTime: 0,
  })
}

export const useExtendQRSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ periodId, minutes }) => qrAPI.extendQRSession(periodId, minutes),
    onSuccess: () => {
      toast.success('QR session extended!')
      queryClient.invalidateQueries('qrSession')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to extend QR session')
    },
  })
}

export const useStopQRSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: qrAPI.stopQRSession,
    onSuccess: () => {
      toast.success('QR session stopped!')
      queryClient.invalidateQueries('qrSession')
      queryClient.invalidateQueries('currentPeriods')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to stop QR session')
    },
  })
}

// Attendance hooks
export const useScanQR = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: attendanceAPI.scanQR,
    onSuccess: (data) => {
      toast.success(`Attendance marked: ${data.attendance.status}`)
      queryClient.invalidateQueries('myAttendance')
      queryClient.invalidateQueries('attendanceSummary')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to mark attendance')
    },
  })
}

export const useMyAttendance = (params) => {
  return useQuery({
    queryKey: ['myAttendance', params],
    queryFn: () => attendanceAPI.getMyAttendance(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAttendance = (params) => {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => attendanceAPI.getAttendance(params),
    staleTime: 2 * 60 * 1000,
  })
}

export const useManualOverride = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: attendanceAPI.manualOverride,
    onSuccess: () => {
      toast.success('Attendance updated successfully!')
      queryClient.invalidateQueries('attendance')
      queryClient.invalidateQueries('attendanceSummary')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update attendance')
    },
  })
}

// Reports hooks
export const useAttendanceSummary = (params) => {
  return useQuery({
    queryKey: ['attendanceSummary', params],
    queryFn: () => attendanceAPI.getAttendanceSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAttendanceReports = (params) => {
  return useQuery({
    queryKey: ['attendanceReports', params],
    queryFn: () => reportsAPI.getAttendanceReports(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useStudentReports = (params) => {
  return useQuery({
    queryKey: ['studentReports', params],
    queryFn: () => reportsAPI.getStudentReports(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTeacherReports = (params) => {
  return useQuery({
    queryKey: ['teacherReports', params],
    queryFn: () => reportsAPI.getTeacherReports(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useLowAttendanceStudents = (params) => {
  return useQuery({
    queryKey: ['lowAttendanceStudents', params],
    queryFn: () => reportsAPI.getLowAttendanceStudents(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useExportReport = () => {
  return useMutation({
    mutationFn: reportsAPI.exportReport,
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${variables.format || 'csv'}-${Date.now()}.${variables.format || 'csv'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Report exported successfully!')
    },
    onError: (error) => {
      toast.error('Failed to export report')
    },
  })
}

// System hooks
export const useSystemConfig = () => {
  return useQuery({
    queryKey: 'systemConfig',
    queryFn: systemAPI.getConfig,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useSystemStats = () => {
  return useQuery({
    queryKey: 'systemStats',
    queryFn: systemAPI.getSystemStats,
    refetchInterval: 60 * 1000, // Refetch every minute
    staleTime: 0,
  })
}

// Notification hooks
export const useNotifications = (params) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationAPI.getNotifications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries('notifications')
      queryClient.invalidateQueries('unreadCount')
    },
    onError: (error) => {
      toast.error('Failed to mark notifications as read')
    },
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: 'unreadCount',
    queryFn: notificationAPI.getUnreadCount,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 0,
  })
}