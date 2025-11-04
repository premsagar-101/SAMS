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
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

import { useDepartments } from '../../hooks/useApi'
import { useTeacherReports } from '../../hooks/useApi'

const HODDashboard = () => {
  const { data: departments } = useDepartments()
  const { data: teacherReports } = useTeacherReports()

  // Calculate department statistics
  const getDepartmentStats = () => {
    if (!departments?.departments) {
      return { totalDepartments: 0, activeDepartments: 0 }
    }

    const total = departments.departments.length
    const active = departments.departments.filter(d => d.isActive).length

    return { totalDepartments, activeDepartments }
  }

  const deptStats = getDepartmentStats()

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                HOD Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Department overview and analytics
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Statistics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DashboardIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Departments</Typography>
              </Box>
              <Typography variant="h3">{deptStats.totalDepartments}</Typography>
              <Typography variant="body2" color="text.secondary">
                {deptStats.activeDepartments} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Teachers</Typography>
              </Box>
              <Typography variant="h3">
                {/* This would come from API - showing placeholder */}
                45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h3">
                {/* This would come from API - showing placeholder */}
                1,234
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Attendance</Typography>
              </Box>
              <Typography variant="h3">
                {/* This would come from API - showing placeholder */}
                89.2%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Department-wide average
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Low Attendance</Typography>
              </Box>
              <Typography variant="h3">
                {/* This would come from API - showing placeholder */}
                45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students below 75% attendance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Overview
              </Typography>

              {departments?.departments?.length > 0 ? (
                <Grid container spacing={2}>
                  {departments.departments.map((dept) => (
                    <Grid item xs={12} sm={6} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">
                            {dept.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dept.code}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  Teachers: {dept.teacherCount || 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  Students: {dept.studentCount || 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                  Programs: {dept.programs?.length || 0}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  dept.studentsEnrolled > 0
                                    ? (dept.studentsEnrolled / (dept.studentCount || 1)) * 100
                                    : 0
                                }
                                sx={{ mt: 1 }}
                              />
                              <Typography variant="caption">
                                {dept.studentsEnrolled || 0} students enrolled
                              </Typography>
                            </Box>
                        </CardContent>
                      </Card>
                    ))
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No departments configured yet. Please contact your administrator.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Reports
              </Typography>

              {teacherReports?.reports?.length > 0 ? (
                <Grid container spacing={2}>
                  {teacherReports.reports.slice(0, 3).map((report, index) => (
                    <Grid item xs={12} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">
                            {report.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {report.date}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {report.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No reports available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default HODDashboard