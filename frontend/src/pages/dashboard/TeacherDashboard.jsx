import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  QrCodeScanner,
  Class as ClassIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material'

import { useCurrentPeriods } from '../../hooks/useApi'
import QRGenerator from '../attendance/QRGenerator'
import AttendanceManagement from '../attendance/AttendanceManagement'

const TeacherDashboard = () => {
  const {
    data: currentPeriods,
    isLoading: periodsLoading,
  } = useCurrentPeriods()

  // Check if there's a current period
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
                Welcome to Teacher Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your classes and track student attendance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Class
              </Typography>
              {periodsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : hasActivePeriod ? (
                <Box>
                  <Typography variant="h6" color="primary">
                    {currentPeriod.subject?.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Room: {currentPeriod.room}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(currentPeriod.startTime).toLocaleTimeString()} - {new Date(currentPeriod.endTime).toLocaleTimeString()}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <QRGenerator periodId={currentPeriod._id} />
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No active classes at the moment
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule
              </Typography>
              {periodsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {currentPeriods && currentPeriods.length > 0 ? (
                    currentPeriods.slice(0, 3).map((period, index) => (
                      <Box key={period._id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">
                          {period.subject?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {period.room} • {new Date(period.startTime).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {period.studentsEnrolled || 0} students enrolled
                        </Typography>
                        {period.qrGenerated && (
                          <Typography variant="caption" color="success.main">
                            ✓ QR Code Active
                          </Typography>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No classes scheduled for today
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Class Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DashboardIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Today's Classes</Typography>
              </Box>
              <Typography variant="h3">
                {currentPeriods?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h3">
                {/* This would come from API - showing placeholder */}
                245
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all classes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Attendance</Typography>
              </Box>
              <Typography variant="h3">
                {/* This would come from API - showing placeholder */}
                87.5%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all classes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Management
              </Typography>
              <Box sx={{ height: '400px' }}>
                <AttendanceManagement />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TeacherDashboard