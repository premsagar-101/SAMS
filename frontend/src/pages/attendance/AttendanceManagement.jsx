import React, { useState, useEffect } from 'react'
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
  Chip,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

import { useCurrentPeriods } from '../../hooks/useApi'
import { useManualOverride } from '../../hooks/useApi'
import { useAttendance } from '../../hooks/useApi'

const AttendanceManagement = () => {
  const { data: currentPeriods } = useCurrentPeriods()
  const { data: attendance, refetch: refetchAttendance } = useAttendance({
    params: { periodId: currentPeriods?.[0]?._id }
  })
  const { mutate: manualOverride } = useManualOverride()

  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [overrideData, setOverrideData] = useState({
    studentId: '',
    status: 'present',
    reason: '',
  })

  // Auto-select current period
  useEffect(() => {
    if (currentPeriods && currentPeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(currentPeriods[0])
    }
  }, [currentPeriods, selectedPeriod])

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

  const attendanceStats = getAttendanceStats()

  const handleManualOverride = (studentId, status, reason) => {
    setOverrideData({ studentId, status, reason })
    setShowOverrideDialog(true)
  }

  const handleOverrideSubmit = async () => {
    if (!overrideData.studentId || !overrideData.reason) {
      return
    }

    try {
      await manualOverride.mutateAsync({
        studentId: overrideData.studentId,
        periodId: selectedPeriod?._id,
        status: overrideData.status,
        reason: overrideData.reason,
      })

      setShowOverrideDialog(false)
      setOverrideData({ studentId: '', status: 'present', reason: '' })
      refetchAttendance()
    } catch (error) {
      console.error('Manual override failed:', error)
    }
  }

  const handleFilterChange = (status) => {
    setFilterStatus(status)
  }

  const filteredAttendance = attendance?.attendance?.filter(record => {
    if (filterStatus === 'all') return true
    return record.status === filterStatus
  }) || []

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Attendance Management
        </Typography>

        {selectedPeriod && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Current Period: {selectedPeriod.subject?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(selectedPeriod.startTime).toLocaleTimeString()} - {' '}
              {new Date(selectedPeriod.endTime).toLocaleTimeString()}
            </Typography>
          </Box>
        )}

        {/* Stats Overview */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
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

        {/* Filter Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label="All"
            color={filterStatus === 'all' ? 'primary' : 'default'}
            onClick={() => handleFilterChange('all')}
            size="small"
          />
          <Chip
            label="Present"
            color={filterStatus === 'present' ? 'success' : 'default'}
            onClick={() => handleFilterChange('present')}
            size="small"
          />
          <Chip
            label="Late"
            color={filterStatus === 'late' ? 'warning' : 'default'}
            onClick={() => handleFilterChange('late')}
            size="small"
          />
          <Chip
            label="Absent"
            color={filterStatus === 'absent' ? 'error' : 'default'}
            onClick={() => handleFilterChange('absent')}
            size="small"
          />
        </Box>

        {/* Attendance Table */}
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {record.student?.firstName} {record.student?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.student?.email}
                          </Typography>
                        </Box>
                      </Box>
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
                        {record.scanTime ? new Date(record.scanTime).toLocaleTimeString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.location?.coordinates
                          ? `GPS: ${record.location.coordinates[1].toFixed(4)}, ${record.location.coordinates[0].toFixed(4)}`
                          : 'N/A'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Mark as Present">
                          <IconButton
                            size="small"
                            onClick={() => handleManualOverride(
                              record.student?._id,
                              'present',
                              'Marked present by teacher'
                            )}
                          >
                            <CheckCircleIcon color="success" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as Absent">
                          <IconButton
                            size="small"
                            onClick={() => handleManualOverride(
                              record.student?._id,
                              'absent',
                              'Marked absent by teacher'
                            )}
                          >
                            <ErrorIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No attendance records found for this period.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetchAttendance()}
          >
            Refresh
          </Button>
          <Typography variant="body2" color="text.secondary">
            Total: {attendanceStats.total} students
          </Typography>
        </Box>

        {/* Manual Override Dialog */}
        <Dialog open={showOverrideDialog} onClose={() => setShowOverrideDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Manual Attendance Override
            <IconButton
              aria-label="close"
              onClick={() => setShowOverrideDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Reason for changing attendance status:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              value={overrideData.reason}
              onChange={(e) => setOverrideData(prev => ({ ...prev, reason: e.target.value }))}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowOverrideDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleOverrideSubmit}
              disabled={!overrideData.reason}
            >
              Confirm Override
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default AttendanceManagement