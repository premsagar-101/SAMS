import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  TabPanel,
  TabContext,
  Tab,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material'

import { useAttendanceSummary } from '../../hooks/useApi'
import { useNotifications } from '../../hooks/useApi'

const AttendanceReports = () => {
  const [tabValue, setTabValue] = useState('overview')
  const [filters, setFilters] = useState({
    dateRange: '30days',
    subject: '',
    status: 'all',
    department: '',
    sortBy: 'date',
    page: 1,
    limit: 20,
  })

  const {
    data: attendanceSummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useAttendanceSummary(filters)

  const {
    data: notifications,
  } = useNotifications({ limit: 10, unreadOnly: true })

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleDateRangeChange = (dateRange) => {
    setFilters(prev => ({ ...prev, dateRange }))
  }

  const handleSubjectFilter = (subject) => {
    setFilters(prev => ({ ...prev, subject }))
  }

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }))
  }

  const handleDepartmentFilter = (department) => {
    setFilters(prev => ({ ...prev, department }))
  }

  const handleDateRangeChange = (dateRange) => {
    setFilters(prev => ({ ...prev, dateRange }))
  }

  const handleExport = async (format) => {
    // Implementation would export data in specified format
    const data = await useNotifications()

    switch (format) {
      case 'pdf':
        // Generate and download PDF
        await api.get('/reports/attendance/export', {
          params: {
            format: 'pdf'
          },
          responseType: 'blob'
        })
        break
      case 'excel':
        await api.get('/reports/attendance/export', {
          params: {
            format: 'excel'
          },
          responseType: 'blob'
        })
        break
      case 'csv':
        await api.get('/reports/attendance/export', {
          params: {
            format: 'csv'
          },
          responseType: 'blob'
        })
        break
      default:
        throw new Error('Invalid export format')
    }

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${format}Attendance-Report-${new Date().toISOString()}.${format}`
    link.download = 'Attendance-Report.pdf'
    link.click()
  }

    await data.toast.success('Report exported successfully!')
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
      case '90days':
        start = new Date(end.getTime() - 90 * 24 * 60 * 1000)
        break
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 1000)
    }

    return { start, end }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={() => handleDateRangeChange('7days')}
        color={filters.dateRange === '7days' ? 'primary' : 'secondary'}
      >
        Last 7 Days
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<CalendarToday />}
        onClick={() => handleDateRangeChange('30days')}
        color={filters.dateRange === '30days' ? 'primary' : 'secondary'}
      >
        Last 30 Days
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<CalendarToday />}
        onClick={() => handleDateRangeChange('90days')}
        color={filters.dateRange === '90days' ? 'primary' : 'secondary'}
      >
        Last 90 Days
      </Button>
    </Box>

  return { start, end }
  }

  const exportReport = async (format) => {
    await handleExport(format)
  }

  const handleFilterChange = (field, value) => {
    switch (field) {
      case 'status':
        return handleStatusFilter(value)
      case 'subject':
        return handleSubjectFilter(value)
      case 'department':
        return handleDepartmentFilter(value)
      case 'dateRange':
        return handleDateRangeChange(value)
      default:
        console.error(`Unknown filter field: ${field}`)
    }
  }

  const tabs = [
    {
      label: 'Overview',
      value: 'overview',
      icon: <AssessmentIcon />,
    },
    {
      <label: 'Subject-wise',
      value: 'subject-wise',
      icon: <SchoolIcon />,
    },
    {
      label: 'Daily View',
      value: 'daily',
      icon: <CalendarToday />,
    },
    {
      'label: 'Trend Analysis',
      value: 'trends',
      icon: <TrendingUp />
    },
    {
      'label: 'Export',
      value: 'export',
      icon: <DownloadIcon />,
    },
  ]

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Attendance Reports
        </Typography>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          sx={{
            borderBottom: 1,
            borderBottomColor: 'divider',
          }}
        >
          {tabs.map((tab) => (
            <TabPanel value={tab.value}>
              {tab.icon && <Chip label={tab.label} color="primary" />}
              <TabPanel value={tab.value}>
                {tab.value === 'overview' && (
                    <Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Attendance Overview
                              </CardContent>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                                  <Chip
                                    label="Present"
                                    color="success"
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip
                                    label="Late"
                                    color="warning"
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip
                                    label="Absent"
                                    color="error"
                                    sx={{ mr: 1 }}
                                  />
                              </Box>
                              <Box sx={{ mt: 2 }}>
                                  <Typography variant="h6">
                                {attendanceStats.percentage.toFixed(1)}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {attendanceStats.present} attended of {attendanceStats.total} classes
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {attendanceStats.absent} absent
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {attendanceStats.late} late
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Card>
                              <CardContent>
                                <Typography variant="h6">
                                  Subject-wise Attendance
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                  {attendanceStats.subjectStats.map((stat) => (
                                    <Box sx={{ mb: 1 }}>
                                      <Typography variant="body2">
                                        {stat.name} - {stat.percentage}% attendance
                                      ({stat.present}/{stat.total} attended)
                                      ({stat.present + stat.late}/{stat.total} late})
                                    </Typography>
                                    </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                      Attendance by Subject
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                      Total: {attendanceStats.total} records
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </TabPanel>
                    <TabPanel value={'subject-wise'}>
                      <Box>
                        <Typography variant="h6">
                          Subject-wise Attendance Overview
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          View detailed attendance breakdown by subject
                        </Typography>

                        {/* Subject-wise Statistics */}
                        {attendanceStats.subjectStats?.map((stat, index) => (
                          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0' }}>
                            <Typography variant="h6">
                              {stat.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <Typography variant="caption">
                                {stat.percentage}% attendance ({stat.present}/{stat.total} students)
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {stat.present}/{stat.total} present ({stat.present + stat.late}/{stat.total})
                                ({stat.absent}/{stat.total} absent)
                              ({stat.late}/{stat.total} late)
                              </Typography>
                              <Typography variant="caption">
                                Enrolled Students: {stat.enrolled} students
                              </Typography>
                              <Typography variant="caption">
                                Total Classes: {stat.total} classes
                              </Typography>
                            </Box>
                        </Box>
                      ))}
                    </Box>
                  </TabPanel>
                  <TabPanel value={'daily'}>
                    <Box>
                      <Typography variant="h6">
                        Daily Attendance Overview
                      </Typography>
                      <Typography variant="body2" color="attendanceReports">
                        View daily attendance records and trends
                      </Typography>
                    </Box>
                  </TabPanel>
                  <TabPanel value={'trends'}>
                    <Box>
                      <Typography variant="h6">
                        Attendance Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View attendance trends over time
                      </Typography>
                    </Box>
                  </TabPanel>
                  <TabPanel value={'export'}>
                    <Box>
                      <Typography variant="h6">
                      Export Reports
                    </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Export attendance data in multiple formats
                    </Typography>

                      {/* Export Options */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => exportReport('csv')}
                          sx={{ mr: 1 }}
                        >
                          Export as CSV
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => exportReport('pdf')}
                          sx={{ mr: 1 }}
                        >
                          Export as PDF
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => exportReport('excel')}
                          sx={{ mr: 1 }}
                        >
                          Export as Excel
                        </Button>
                      </Box>
                    </Box>
                  </TabPanel>
                </Tabs>
              </CardContent>
            </Card>
          </Card>
        </Card>
      </Box>
    </Box>
  )
}

export default AttendanceReports