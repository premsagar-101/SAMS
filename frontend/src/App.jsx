import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'

// Import pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Dashboard pages
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import HODDashboard from './pages/dashboard/HODDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

// Attendance pages
import QRGenerator from './pages/attendance/QRGenerator'
import QRScanner from './pages/attendance/QRScanner'
import AttendanceHistory from './pages/attendance/AttendanceHistory'
import AttendanceManagement from './pages/attendance/AttendanceManagement'

// Academic pages
import Departments from './pages/academic/Departments'
import Programs from './pages/academic/Programs'
import Subjects from './pages/academic/Subjects'
import Timetable from './pages/academic/Timetable'

// Reports pages
import AttendanceReports from './pages/reports/AttendanceReports'
import StudentReports from './pages/reports/StudentReports'
import TeacherReports from './pages/reports/TeacherReports'

// Profile and settings
import Profile from './pages/profile/Profile'
import Settings from './pages/profile/Settings'
import Notifications from './pages/notifications/Notifications'

// Not found page
import NotFound from './pages/NotFound'

function App() {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <div>Loading...</div>
      </Box>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/forgot-password"
        element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/reset-password"
        element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              {user?.role === 'student' && <StudentDashboard />}
              {user?.role === 'teacher' && <TeacherDashboard />}
              {user?.role === 'hod' && <HODDashboard />}
              {user?.role === 'admin' && <AdminDashboard />}
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="qr-scanner"
          element={<ProtectedRoute allowedRoles={['student']}><QRScanner /></ProtectedRoute>}
        />
        <Route
          path="attendance-history"
          element={<ProtectedRoute allowedRoles={['student']}><AttendanceHistory /></ProtectedRoute>}
        />

        {/* Teacher routes */}
        <Route
          path="qr-generator"
          element={<ProtectedRoute allowedRoles={['teacher']}><QRGenerator /></ProtectedRoute>}
        />
        <Route
          path="attendance-management"
          element={<ProtectedRoute allowedRoles={['teacher', 'hod']}><AttendanceManagement /></ProtectedRoute>}
        />

        {/* Academic routes */}
        <Route
          path="departments"
          element={<ProtectedRoute allowedRoles={['admin', 'hod']}><Departments /></ProtectedRoute>}
        />
        <Route
          path="programs"
          element={<ProtectedRoute allowedRoles={['admin', 'hod']}><Programs /></ProtectedRoute>}
        />
        <Route
          path="subjects"
          element={<ProtectedRoute allowedRoles={['admin', 'hod']}><Subjects /></ProtectedRoute>}
        />
        <Route
          path="timetable"
          element={<ProtectedRoute allowedRoles={['teacher', 'hod', 'admin']}><Timetable /></ProtectedRoute>}
        />

        {/* Reports routes */}
        <Route
          path="reports/attendance"
          element={<ProtectedRoute allowedRoles={['teacher', 'hod', 'admin']}><AttendanceReports /></ProtectedRoute>}
        />
        <Route
          path="reports/students"
          element={<ProtectedRoute allowedRoles={['hod', 'admin']}><StudentReports /></ProtectedRoute>}
        />
        <Route
          path="reports/teachers"
          element={<ProtectedRoute allowedRoles={['hod', 'admin']}><TeacherReports /></ProtectedRoute>}
        />

        {/* Profile and settings */}
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App