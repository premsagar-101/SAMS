import React, { useState } from 'react'
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
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

import { useDepartment } from '../../hooks/useApi'

const HODDashboard = () => {
  const { departments, isLoading } = useDepartment()

  const getDepartmentStats = () => {
    if (!departments) {
      return {
        totalDepartments: 0,
        totalPrograms: 0,
        totalStudents: 0,
        totalTeachers: 0,
        avgAttendance: 0
      }
    }

    return departments.reduce((acc, dept) => ({
      totalDepartments: acc.totalDepartments + 1,
      totalPrograms: acc.totalPrograms + (dept.programs?.length || 0),
      totalStudents: acc.totalStudents + (dept.studentCount || 0),
      totalTeachers: acc.totalTeachers + (dept.teacherCount || 0),
      avgAttendance: acc.avgAttendance + (dept.avgAttendance || 0)
    }), {
      totalDepartments: 0,
      totalPrograms: 0,
      totalStudents: 0,
      totalTeachers: 0,
      avgAttendance: 0
    })
  }

  const departmentStats = getDepartmentStats()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Department Dashboard
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Departments</Typography>
                </Box>
                <Typography variant="h3">{departmentStats.totalDepartments}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active departments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Students</Typography>
                </Box>
                <Typography variant="h3">{departmentStats.totalStudents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total enrolled students
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Teachers</Typography>
                </Box>
                <Typography variant="h3">{departmentStats.totalTeachers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Teaching staff
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Avg Attendance</Typography>
                </Box>
                <Typography variant="h3">
                  {departmentStats.totalDepartments > 0
                    ? (departmentStats.avgAttendance / departmentStats.totalDepartments).toFixed(1)
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average attendance rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Department Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Overview
                </Typography>

                {departments && departments.length > 0 ? (
                  <Grid container spacing={3}>
                    {departments.map((dept) => (
                      <Grid item xs={12} sm={6} md={4} key={dept._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {dept.name}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                Programs: {dept.programs?.length || 0}
                              </Typography>
                              <Typography variant="body2">
                                Teachers: {dept.teacherCount || 0}
                              </Typography>
                              <Typography variant="body2">
                                Students: {dept.studentCount || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Avg Attendance: {dept.avgAttendance || 0}%
                              </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={dept.avgAttendance || 0}
                                color={dept.avgAttendance >= 75 ? 'success' : 'warning'}
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Attendance rate
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No departments found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create departments to start tracking attendance.
                    </Typography>
                  </Box>
                )}
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

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => window.location.href = '/reports/attendance'}
                    startIcon={<AssessmentIcon />}
                  >
                    View Reports
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => window.location.href = '/subjects'}
                    startIcon={<SchoolIcon />}
                  >
                    Manage Subjects
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => window.location.href = '/attendance'}
                    startIcon={<PeopleIcon />}
                  >
                    Attendance
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => window.location.href = '/timetable'}
                    startIcon={<TrendingIcon />}
                  >
                    Timetable
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Alerts */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Alerts
                </Typography>

                {departments && departments.some(dept => (dept.avgAttendance || 0) < 75) ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <WarningIcon sx={{ mr: 1 }} />
                    Some departments have low attendance rates. Please review and take necessary actions.
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    All departments are maintaining good attendance rates.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default HODDashboard