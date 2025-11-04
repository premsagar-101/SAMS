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
  Chip,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
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

  const handleExport = async (format) => {
    // Implementation would export data in specified format
    console.log(`Exporting as ${format}`)
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

  const getAttendanceStats = () => {
    if (!attendanceSummary?.summary) {
      return {
        percentage: 0,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        subjectStats: []
      }
    }

    return {
      percentage: attendanceSummary.summary.attendancePercentage || 0,
      present: attendanceSummary.summary.attendedPeriods || 0,
      absent: attendanceSummary.summary.absentPeriods || 0,
      late: attendanceSummary.summary.latePeriods || 0,
      total: attendanceSummary.summary.totalPeriods || 0,
      subjectStats: attendanceSummary.subjectBreakdown || []
    }
  }

  const attendanceStats = getAttendanceStats()

  const tabs = [
    {
      label: 'Overview',
      value: 'overview',
      icon: <AssessmentIcon />,
    },
    {
      label: 'Subject-wise',
      value: 'subject-wise',
      icon: <AssessmentIcon />,
    },
    {
      label: 'Daily View',
      value: 'daily',
      icon: <CalendarIcon />,
    },
    {
      label: 'Trend Analysis',
      value: 'trends',
      icon: <TrendingUpIcon />,
    },
    {
      label: 'Export',
      value: 'export',
      icon: <DownloadIcon />,
    },
  ]

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Attendance Reports
          </Typography>

          {/* Date Range Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 3 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => handleDateRangeChange('7days')}
              color={filters.dateRange === '7days' ? 'primary' : 'secondary'}
            >
              Last 7 Days
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => handleDateRangeChange('30days')}
              color={filters.dateRange === '30days' ? 'primary' : 'secondary'}
            >
              Last 30 Days
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => handleDateRangeChange('90days')}
              color={filters.dateRange === '90days' ? 'primary' : 'secondary'}
            >
              Last 90 Days
            </Button>
          </Box>

          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderBottomColor: 'divider' }}>
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  icon={tab.icon}
                  onClick={() => handleChangeTab(null, tab.value)}
                />
              ))}
            </Box>

            <TabPanel value="overview">
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Attendance Overview
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
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
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          Subject-wise Attendance
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {attendanceStats.subjectStats.map((stat, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                              <Typography variant="body2">
                                {stat.subject} - {stat.percentage}% attendance
                                ({stat.present}/{stat.total} attended)
                              </Typography>
                            </Box>
                          ))}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Attendance by Subject
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total: {attendanceStats.total} records
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value="subject-wise">
              <Box>
                <Typography variant="h6">
                  Subject-wise Attendance Overview
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View detailed attendance breakdown by subject
                </Typography>

                {/* Subject-wise Statistics */}
                {attendanceStats.subjectStats?.map((stat, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6">
                      {stat.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <Typography variant="caption" display="block">
                        {stat.percentage}% attendance ({stat.present}/{stat.total} students)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.present}/{stat.total} present ({stat.present + stat.late}/{stat.total})
                      </Typography>
                      <Typography variant="caption" display="block">
                        Enrolled Students: {stat.enrolled || 0} students
                      </Typography>
                      <Typography variant="caption" display="block">
                        Total Classes: {stat.total} classes
                      </Typography>
                    </Typography>
                  </Box>
                ))}
              </Box>
            </TabPanel>

            <TabPanel value="daily">
              <Box>
                <Typography variant="h6">
                  Daily Attendance Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View daily attendance records and trends
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value="trends">
              <Box>
                <Typography variant="h6">
                  Attendance Trends
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View attendance trends over time
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value="export">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Export Reports
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Export attendance data in multiple formats
                </Typography>

                {/* Export Options */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('csv')}
                  >
                    Export as CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('pdf')}
                  >
                    Export as PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('excel')}
                  >
                    Export as Excel
                  </Button>
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AttendanceReports