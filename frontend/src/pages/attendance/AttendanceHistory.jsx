import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircle,
  Warning as WarningIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material'

import { useMyAttendance } from '../../hooks/useApi'
import { useAttendance } from '../../hooks/useApi'
import { useNotifications } from '../../hooks/useApi'

const AttendanceHistory = () => {
  const { data: attendance } = useMyAttendance({
    params: { limit: 50, page: 1 }
  })

  const getAttendanceStats = () => {
    if (!attendance || !attendance.attendance || !attendance.attendance) {
      return { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }
    }

    const stats = attendance.attendance.reduce(
      (acc, curr) => {
        const status = curr.status || 'present'
        return {
          present: curr.status === 'present' ? 1 : 0,
          absent: curr.status === 'absent' ? 1 : 0,
          late: curr.status === 'late' ? 1 : 0,
        }
      },
      { present: 0, absent: 0, late: 0 }
    )

    const total = stats.present + stats.absent + stats.late
    const percentage = total > 0 ? ((stats.present + stats.late) / total) * 100 : 0

    return { total, present, absent, late, percentage }
  }

  const attendanceStats = getAttendanceStats()

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'present':
        return 'success.main'
      case 'late':
        return 'warning.main'
      case 'absent':
        return 'error.main'
      default:
        return 'grey[500]'
    }
  }

  const getAttendanceIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle color="success" />
      case 'late':
        return <WarningIcon color="warning" />
      case 'absent':
        return <WarningIcon color="error" />
      default:
        return <CheckCircle color="success" />
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: '2-digit',
      second: '2-digit',
      second: '2-digit',
      meridiem: '2-digit',
      timeZone: 'short'
    })
  }

  const getAttendanceStatusBadgeColor = (status) => {
    switch (status) {
      case 'present':
        return 'success'
      case 'late':
        return 'warning'
      case 'absent':
        return 'error'
      default:
        return 'default'
    }
  }

  return getAttendanceStatusBadgeColor(attendanceStats.percentage)

  if (!attendance || attendance.attendance?.length === 0) {
    return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6">
            No attendance records found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your attendance records will appear here once you start scanning QR codes.
          </Typography>
        </Box>
      )
    }
  }

  return (
    <Card>
      <CardContent>
      <Typography variant="h5" gutterBottom>
        Attendance History
      </Typography>

      {/* Stats Overview */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            <Typography variant="h4">
              {attendanceStats.percentage.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {attendanceStats.present} of {attendanceStats.total} classes attended
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            <Box sx={{ mr: 2 }}>
              <Chip
                color="success"
                label="Present"
                color="primary"
              />
            </Box>
            <Box sx={{ mr: 2 }}>
              <Chip
                color="warning"
                label="Late"
                color="warning"
              />
            </Box>
            <Box sx={{ mr: 2 }}>
              <Chip
                color="error"
                label="Absent"
                color="error"
              />
            </Box>
            <Box sx={{ mr: 2 }}>
              <Chip
                color="info"
                label="Total"
                color="info"
              />
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {attendanceStats.total} total attendance records
            </Typography>
          </Box>
        </Box>

        {/* Attendance List */}
        <Paper sx={{ height: 400, overflow: 'auto' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              </TableHead>
              <TableBody>
                {attendance?.attendance?.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(record.scanTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                      {record.subject?.name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getAttendanceStatusColor(record.status)}
                        icon={getAttendanceIcon(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                      {formatDate(record.scanTime)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.teacher?.firstName} {record.teacher?.lastName}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          </Paper>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {attendance?.pagination?.page || 1} of {attendance?.pagination?.total || 0} records
            </Typography>
            <Button
              onClick={() => {
              // Load more records
            }}
              disabled={!attendance?.pagination?.hasNext}
            >
              Load More
            </Button>
          </Box>
        </Card>
      </Card>
    </Box>
  )
}

export default AttendanceHistory