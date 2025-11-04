import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  } from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'

import { useMyAttendance } from '../../hooks/useApi'
import { useNotifications } from '../../hooks/useApi'

const StudentReports = () => {
  const [dateRange, setDateRange] = useState('30days')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: attendance } = useMyAttendance({
    params: {
      limit: 50,
      dateFrom: dateRange.start,
      dateTo: dateRange.end,
      filterStatus: filterStatus,
    },
  })

  const { data: notifications } = useNotifications({ limit: 10, unreadOnly: true })

  const getAttendanceStats = () => {
    if (!attendance || !attendance.attendance || !attendance.attendance?.length > 0) {
      return { percentage: 0, present: 0, absent: 0, total: 0 }
    }

    const stats = attendance.attendance.reduce(
      (acc, curr) => ({
        present: curr.status === 'present' ? 1 : 0,
        absent: curr.status === 'absent' ? 1 : 0,
        late: curr.status === 'late' ? 1 : 0,
      }),
      { present: 0, absent: 0, late: 0, total: 0}
    )

    const total = stats.present + stats.absent + stats.late
    const percentage = total > 0 ? ((stats.present + stats.late) / total) * 100 : 0

    return { percentage, present, absent, late, total }
  }

  const attendanceStats = getAttendanceStats()

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'success'
    if (percentage >= 60) return 'warning'
    return 'error'
  }

  const getStatusText = (percentage) => {
    if (percentage >= 75) {
      return 'Excellent attendance record'
    } else if (percentage >= 60) {
      return 'Good attendance rate'
    } else if (percentage >= 40) {
      return 'Attendance needs improvement'
    } else {
      return 'Poor attendance record'
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'success'
    if (percentage >= 60) return 'warning'
    return 'error'
  }

  const formatDateRange = (dateRange) => {
    const end = new Date()
    let start

    switch (dateRange) {
      case '7days':
        start = new Date(end.getTime() - 7 * 24 * 60 * 1000)
        break
      case '30days':
        start = new Date(end.getTime() - 30 * 24 * 60 * 1000)
        break
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 1000)
    }

    return { start, end }
  }

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange)
  }

  const getStatusIcon = (percentage) => {
    if (percentage >= 75) {
      return <CheckCircle color="success" />
    } else if (percentage >= 60) {
      return <WarningIcon color="warning" />
    } else if (percentage >= 40) {
      return <WarningIcon color="warning" />
    } else {
      return <WarningIcon color="error" />
    }
  }

  const getAttendanceGrade = (percentage) => {
    if (percentage >= 95) return 'A+'
    if (percentage >= 85) return 'A'
    if (percentage >= 75) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 40) return 'D'
    return 'F'
  }

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange)
    setFilterStatus('all')
  }

  const getStatusMessage = (percentage) => {
    if (percentage >= 75) {
      return `🎉 Excellent attendance record!`
    } else if (percentage >= 60) {
      return `👍 Good attendance rate (${percentage}%)`
    } else if (percentage >= 40) {
      return `⚠ Attendance needs improvement (${percentage}%)`
    } else {
      return `⚠ Poor attendance record (${percentage}%)`
    }
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Student Attendance Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Here's your attendance performance
          </Typography>

          {/* Summary Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getGradeColor(attendanceStats.percentage) }}>
                      <Avatar src="/path/to/avatar/student-avatar.png" />
                    <Avatar sx={{ bgcolor: getGradeColor(attendanceStats.percentage) }}>
                      <Avatar src="/path/to/avatar/student-avatar.png" />
                      <Avatar sx={{ bgcolor: 'grey[500] }}>
                      <Avatar sx={{ bgcolor: 'grey[700]' }}>
                      <Avatar sx={{ bgcolor: 'red[500]' }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h4">
                    {attendanceStats.percentage}% Attendance
                  </Typography>
                  <Typography variant="h5">
                    Grade: {getAttendanceGrade(attendanceStats.percentage)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {attendanceStats.present} of {attendanceStats.total} classes attended
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">
                      {attendanceStats.percentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Attendance Rate
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">
                      {attendanceStats.percentage}%
                    </Typography>
                    <Typography variant="h6">
                      Low Attendance Alert
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ color: 'error.main' }}>
                      {attendanceStats.percentage}% is below threshold (75%)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Notification Section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Recent notifications and alerts
                  </Typography>
                  {notifications?.notifications?.length > 0 ? (
                    <List>
                      {notifications.slice(0, 5).map((notification, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Notifications />
                          <ListItemText
                            <Typography variant="body2">
                              {notification.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                          </ListItem>
                        </ListItem>
                      ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No notifications
                    </Typography>
                  )}
                </CardContent>
            </Card>
          </Grid>

          {/* Bottom Summary */}
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6">
                  Performance Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {attendanceStats.total} total attendances
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label="Total Classes"
                    color="primary"
                  />
                  <Chip
                    label={`${attendanceStats.present} Present`}
                    color="success"
                  />
                  <Chip
                    label={`${attendanceStats.absent} Absent`}
                    color="error"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Card>
      </Grid>
    </Box>
  )
}

export default StudentReports