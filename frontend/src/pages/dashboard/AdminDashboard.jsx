import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
  Chip,
  Button,
  Paper,
  Alert,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  Class as ClassIcon,
  CalendarToday as CalendarToday,
  AlertTitle,
  AlertDescription,
} from '@mui/icons-material'

import { useSystemStats } from '../../hooks/useApi'

const AdminDashboard = () => {
  const { data: systemStats } = useSystemStats()

  const getHealthStatus = () => {
    if (systemStats) {
      return {
        database: 'healthy',
        api: 'operational',
        notifications: 'active',
        lastBackup: systemStats.lastBackup || 'Never',
      }
    }
    return {
      database: 'unhealthy',
      api: 'error',
      notifications: 'inactive',
      lastBackup: 'Never',
    }
  }

  const healthStatus = getHealthStatus()
  const isHealthy = Object.values(healthStatus).every(status => status === 'healthy')

  return (
    <Box>
      <Grid container spacing={3}>
        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                System Health
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall system status and performance metrics
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Settings sx={{ mr: 1 }} />
                <Typography variant="h6">System Configuration</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={isHealthy ? 100 : 75}
                  color={isHealthy ? 'success' : 'error'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                All systems operational
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="h3">{systemStats?.users?.total || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active users in system
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Academic Structure</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  Departments: {systemStats?.departments?.total || 0}
                </Typography>
                <Typography variant="body2">
                  Programs: {systemStats?.programs?.total || 0}
                </Typography>
                <Typography variant="body2">
                  Subjects: {systemStats?.subjects?.total || 0}
                </Typography>
                <Typography variant="body2">
                  Semesters: {systemStats?.semesters?.total || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Performance</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  API Response: {systemStats?.avgResponseTime || 0}ms
                </Typography>
                <Typography variant="body2">
                  Uptime: {systemStats?.uptime || 0}s
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Growth Metrics</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  New users this month: {systemStats?.newUsers || 0}
                </Typography>
                <Typography variant="body2">
                  Active sessions: {systemStats?.activeSessions || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/departments'}
                  startIcon={<SchoolIcon />}
                >
                  Departments
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/subjects'}}
                  startIcon={<ClassIcon />}
                >
                  Subjects
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/semesters'}}
                  startIcon={<CalendarToday />}
                >
                  Semesters
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/timetable'}}
                  startIcon={<CalendarToday />}
                >
                  Timetable
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/reports/attendance'}}
                  startIcon={<AssessmentIcon />}
                >
                  Reports
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/config'}}
                  startIcon={<SettingsIcon />}
                >
                  Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Alerts
              </Typography>

              {/* System Status */}
              <Alert
                severity={isHealthy ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                <AlertTitle>
                  {isHealthy ? 'All Systems Operational' : 'System Issues Detected'}
                </AlertTitle>
                <AlertDescription>
                  {isHealthy
                    ? 'All systems are functioning normally.'
                    : 'Some systems require attention: ' +
                    Object.entries(healthStatus)
                      .filter(([key, value]) => value !== 'healthy')
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')
                </AlertDescription>
              </Alert>

              {/* Recent System Activity */}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last backup: {systemStats?.lastBackup || 'Never'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard