import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material'
import {
  CalendarToday,
  QrCodeScanner,
  History,
  Notifications,
  TrendingUp,
  School,
  AccessTime,
  LocationOn,
  CheckCircle,
  Warning,
} from '@mui/icons-material'

import { useMyAttendance } from '../../hooks/useApi'
import { useCurrentPeriods } from '../../hooks/useApi'
import { useNotifications } from '../../hooks/useApi'
import QRScanner from '../../components/QRScanner'
import AttendanceHistory from '../attendance/AttendanceHistory'

const StudentDashboard = () => {
  const {
    data: attendance,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useMyAttendance()

  const {
    data: currentPeriods,
    isLoading: periodsLoading,
  } = useCurrentPeriods()

  const {
    data: notifications,
    unreadCount,
  } = useNotifications({ limit: 3 })

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (!attendance || !attendance.attendance) {
      return { percentage: 0, present: 0, absent: 0, late: 0, total: 0 }
    }

    const stats = attendance.attendance
    const total = stats.total || 0
    const present = stats.present || 0
    const absent = stats.absent || 0
    const late = stats.late || 0
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0

    return { percentage, present, absent, late, total }
  }

  const attendanceStats = getAttendanceStats()

  // Check if there's a current period for QR scanning
  const hasActivePeriod = currentPeriods && currentPeriods.length > 0
  const currentPeriod = hasActivePeriod ? currentPeriods[0] : null

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome back, {attendance?.user?.firstName}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Here's your attendance overview for today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Attendance Rate</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {attendanceStats.percentage.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {attendanceStats.present} of {attendanceStats.total} classes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Classes</Typography>
              </Box>
              <Typography variant="h4">{attendanceStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                This semester
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Present</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {attendanceStats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Late</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {attendanceStats.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                After start time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Period / QR Scanner */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                {hasActivePeriod ? 'Current Class - QR Scanner' : 'No Active Classes'}
              </Typography>

              {periodsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                  <CircularProgress />
                </Box>
              ) : hasActivePeriod ? (
                <QRScanner
                  periodId={currentPeriod._id}
                  subjectName={currentPeriod.subject?.name}
                  room={currentPeriod.room}
                  endTime={currentPeriod.endTime}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    textAlign: 'center',
                  }}
                >
                  <QrCodeScanner sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Active Classes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for your scheduled classes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notifications */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Notifications</Typography>
                {unreadCount > 0 && (
                  <Chip
                    label={unreadCount}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {notifications?.length > 0 ? (
                notifications.slice(0, 3).map((notification) => (
                  <Box key={notification._id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2" gutterBottom>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent notifications
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <History sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Attendance</Typography>
              </Box>
              <AttendanceHistory />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default StudentDashboard