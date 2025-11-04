import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // Update tokens in localStorage
        localStorage.setItem('accessToken', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData)
    return response.data
  },

  // Refresh token
  refreshToken: async (data) => {
    const response = await api.post('/auth/refresh', data)
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data)
    return response.data
  },

  // OAuth URLs
  getGoogleOAuthUrl: () => {
    return `${api.defaults.baseURL}/auth/oauth/google`
  },

  getMicrosoftOAuthUrl: () => {
    return `${api.defaults.baseURL}/auth/oauth/microsoft`
  },
}

export const academicAPI = {
  // Departments
  getDepartments: async () => {
    const response = await api.get('/academic/departments')
    return response.data
  },

  createDepartment: async (data) => {
    const response = await api.post('/academic/departments', data)
    return response.data
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/academic/departments/${id}`, data)
    return response.data
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/academic/departments/${id}`)
    return response.data
  },

  // Programs
  getPrograms: async (departmentId) => {
    const params = departmentId ? { department: departmentId } : {}
    const response = await api.get('/academic/programs', { params })
    return response.data
  },

  createProgram: async (data) => {
    const response = await api.post('/academic/programs', data)
    return response.data
  },

  updateProgram: async (id, data) => {
    const response = await api.put(`/academic/programs/${id}`, data)
    return response.data
  },

  deleteProgram: async (id) => {
    const response = await api.delete(`/academic/programs/${id}`)
    return response.data
  },

  // Subjects
  getSubjects: async (params) => {
    const response = await api.get('/academic/subjects', { params })
    return response.data
  },

  createSubject: async (data) => {
    const response = await api.post('/academic/subjects', data)
    return response.data
  },

  updateSubject: async (id, data) => {
    const response = await api.put(`/academic/subjects/${id}`, data)
    return response.data
  },

  deleteSubject: async (id) => {
    const response = await api.delete(`/academic/subjects/${id}`)
    return response.data
  },

  // Semesters
  getSemesters: async (params) => {
    const response = await api.get('/academic/semesters', { params })
    return response.data
  },

  createSemester: async (data) => {
    const response = await api.post('/academic/semesters', data)
    return response.data
  },

  updateSemester: async (id, data) => {
    const response = await api.put(`/academic/semesters/${id}`, data)
    return response.data
  },

  deleteSemester: async (id) => {
    const response = await api.delete(`/academic/semesters/${id}`)
    return response.data
  },
}

export const timetableAPI = {
  // Timetable
  getTimetable: async (params) => {
    const response = await api.get('/timetable', { params })
    return response.data
  },

  createTimetableEntry: async (data) => {
    const response = await api.post('/timetable', data)
    return response.data
  },

  updateTimetableEntry: async (id, data) => {
    const response = await api.put(`/timetable/${id}`, data)
    return response.data
  },

  deleteTimetableEntry: async (id) => {
    const response = await api.delete(`/timetable/${id}`)
    return response.data
  },

  // Periods
  getCurrentPeriods: async () => {
    const response = await api.get('/periods/current')
    return response.data
  },

  getUpcomingPeriods: async (hours = 24) => {
    const response = await api.get('/periods/upcoming', { params: { hours } })
    return response.data
  },

  generatePeriods: async (data) => {
    const response = await api.post('/periods/generate', data)
    return response.data
  },

  getDailySchedule: async (date) => {
    const response = await api.get('/periods/daily', { params: { date } })
    return response.data
  },
}

export const qrAPI = {
  // Generate QR code
  generateQR: async (periodId) => {
    const response = await api.post('/qr/generate', { periodId })
    return response.data
  },

  // Get QR session
  getQRSession: async (periodId) => {
    const response = await api.get(`/qr/session/${periodId}`)
    return response.data
  },

  // Extend QR session
  extendQRSession: async (periodId, minutes) => {
    const response = await api.post(`/qr/session/${periodId}/extend`, { minutes })
    return response.data
  },

  // Stop QR session
  stopQRSession: async (periodId) => {
    const response = await api.post(`/qr/session/${periodId}/stop`)
    return response.data
  },

  // Get QR statistics
  getQRStats: async (periodId) => {
    const response = await api.get(`/qr/session/${periodId}/stats`)
    return response.data
  },
}

export const attendanceAPI = {
  // Scan QR code (mark attendance)
  scanQR: async (data) => {
    const response = await api.post('/attendance/scan', data)
    return response.data
  },

  // Get attendance records
  getAttendance: async (params) => {
    const response = await api.get('/attendance', { params })
    return response.data
  },

  // Get my attendance
  getMyAttendance: async (params) => {
    const response = await api.get('/attendance/my-attendance', { params })
    return response.data
  },

  // Manual override
  manualOverride: async (data) => {
    const response = await api.post('/attendance/manual-override', data)
    return response.data
  },

  // Get attendance summary
  getAttendanceSummary: async (params) => {
    const response = await api.get('/reports/attendance-summary', { params })
    return response.data
  },

  // Get attendance statistics
  getAttendanceStats: async (params) => {
    const response = await api.get('/attendance/stats', { params })
    return response.data
  },

  // Export attendance
  exportAttendance: async (params) => {
    const response = await api.get('/reports/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  },
}

export const reportsAPI = {
  // Attendance reports
  getAttendanceReports: async (params) => {
    const response = await api.get('/reports/attendance', { params })
    return response.data
  },

  // Student reports
  getStudentReports: async (params) => {
    const response = await api.get('/reports/students', { params })
    return response.data
  },

  // Teacher reports
  getTeacherReports: async (params) => {
    const response = await api.get('/reports/teachers', { params })
    return response.data
  },

  // Low attendance students
  getLowAttendanceStudents: async (params) => {
    const response = await api.get('/reports/low-attendance', { params })
    return response.data
  },

  // Daily attendance report
  getDailyAttendanceReport: async (date) => {
    const response = await api.get('/reports/daily', { params: { date } })
    return response.data
  },

  // Export reports
  exportReport: async (params) => {
    const response = await api.get('/reports/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  },
}

export const notificationAPI = {
  // Get notifications
  getNotifications: async (params) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  // Mark as read
  markAsRead: async (data) => {
    const response = await api.post('/notifications/mark-read', data)
    return response.data
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    const response = await api.delete('/notifications/clear-all')
    return response.data
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },

  // Send notification (admin)
  sendNotification: async (data) => {
    const response = await api.post('/notifications/send', data)
    return response.data
  },
}

export const systemAPI = {
  // Get system configuration
  getConfig: async () => {
    const response = await api.get('/config')
    return response.data
  },

  // Update system configuration
  updateConfig: async (data) => {
    const response = await api.put('/config', data)
    return response.data
  },

  // Get system stats
  getSystemStats: async () => {
    const response = await api.get('/config/stats')
    return response.data
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  },
}

export default api