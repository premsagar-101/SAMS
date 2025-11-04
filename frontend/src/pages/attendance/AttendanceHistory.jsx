import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material'
import {
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'

import { useMyAttendance } from '../../hooks/useApi'

const AttendanceHistory = () => {
  const [page, setPage] = useState(1)
  const { data: attendance, isLoading } = useMyAttendance({
    params: { limit: 20, page }
  })

  const getAttendanceStats = () => {
    if (!attendance?.attendance) {
      return { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }
    }

    const stats = attendance.attendance.reduce(
      (acc, record) => {
        const status = record.status || 'present'
        return {
          total: acc.total + 1,
          present: status === 'present' ? acc.present + 1 : acc.present,
          absent: status === 'absent' ? acc.absent + 1 : acc.absent,
          late: status === 'late' ? acc.late + 1 : acc.late,
        }
      },
      { total: 0, present: 0, absent: 0, late: 0 }
    )

    const percentage = stats.total > 0 ? ((stats.present + stats.late) / stats.total) * 100 : 0

    return { ...stats, percentage }
  }

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon color="success" />
      case 'late':
        return <WarningIcon color="warning" />
      case 'absent':
        return <ErrorIcon color="error" />
      default:
        return <CheckCircleIcon color="success" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const attendanceStats = getAttendanceStats()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Attendance History
        </Typography>

        {/* Stats Overview */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {attendanceStats.percentage.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {attendanceStats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {attendanceStats.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Late
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {attendanceStats.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absent
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Chip label={`Total: ${attendanceStats.total}`} color="info" size="small" />
          </Box>
        </Box>

        {/* Attendance Table */}
        {attendance?.attendance?.length > 0 ? (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(record.scanTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.subject?.name || 'Unknown Subject'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status || 'present'}
                        color={getStatusColor(record.status)}
                        icon={getStatusIcon(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.location?.coordinates
                          ? `Lat: ${record.location.coordinates[1].toFixed(4)}, Lng: ${record.location.coordinates[0].toFixed(4)}`
                          : 'Location not recorded'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No attendance records found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your attendance records will appear here once you start scanning QR codes.
            </Typography>
          </Box>
        )}

        {/* Load More Button */}
        {attendance?.pagination?.hasNext && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setPage(prev => prev + 1)}
              disabled={isLoading}
            >
              Load More
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default AttendanceHistory