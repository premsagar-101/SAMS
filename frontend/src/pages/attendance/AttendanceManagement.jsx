import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  LinearProgress,
  Avatar,
  Menu,
  MenuItem,
  IconButton as MuiIconButton,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircle,
  Warning as WarningIcon,
} from '@mui/icons-material'

import { useCurrentPeriods } from '../../hooks/useApi'
import { useManualOverride } from '../../hooks/useApi'
import { useAttendance } from '../../hooks/useApi'

const AttendanceManagement = () => {
  const { data: currentPeriods } = useCurrentPeriods()
  const { data: attendance } = useAttendance({ params: { periodId: currentPeriods?.[0]?._id } })
  const { mutate: manualOverride } = useManualOverride()

  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showManualOverrideDialog, setShowManualOverrideDialog] = useState(false)
  const [overrideData, setOverrideData] = useState({
    studentId: '',
    status: 'present',
    reason: '',
  })

  const [selectedStudents, setSelectedStudents] = useState([])

  // Auto-select current period
  useEffect(() => {
    if (currentPeriods && currentPeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(currentPeriods[0])
    }
  }, [currentPeriods, selectedPeriod])

  // Auto-select students when period changes
  useEffect(() => {
    if (selectedPeriod) {
      // Fetch attendance for this period
      // This would be implemented in a real app
      setSelectedStudents([]) // Reset selected students
    }
  }, [selectedPeriod])

  const handleManualOverride = () => {
    setShowManualOverrideDialog(true)
  }

  const handleManualOverrideSubmit = async () => {
    if (!overrideData.studentId || !overrideData.status || !overrideData.reason) {
      return
    }
    try {
      await manualOverride.mutateAsync({
        studentId: overrideData.studentId,
        periodId: selectedPeriod?._id,
        status: overrideData.status,
        reason: overrideData.reason,
      })

      // Refresh attendance data
      // This would refetch attendance for the period
      setShowManualOverrideDialog(false)
      setOverrideData({ studentId: '', status: '', reason: '' })
      setSelectedStudents([])
    } catch (error) {
      console.error('Manual override failed:', error)
    }
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
        return <CheckCircle color="success" />
      case 'late':
        return <WarningIcon color="warning" />
      case 'absent':
        return <WarningIcon color="error" />
      default:
        return <CheckCircle color="success" />
    }
  }

  const getAttendanceStats = () => {
    if (!attendance || !attendance.attendance) {
      return { total: 0, present: 0, absent: 0, late: 0 }
    }

    const stats = attendance.attendance.reduce(
      (acc, curr) => {
        const status = curr.status
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

  const handleSelectPeriod = (period) => {
    setSelectedPeriod(period)
    setFilterStatus('all')
    setSelectedStudents([])
  }

  const handleSelectStudents = (students) => {
    setSelectedStudents(students)
  }

  const getStatusColor = (status) => {
    return {
      present: 'success.main',
      late: 'warning.main',
      absent: 'error.main',
      default: 'grey[500]',
    }[status]
  }

  const handleFilterChange = (status) => {
    setFilterStatus(status)
    setSelectedStudents([])
  }

  const columns = [
    {
      id: 'student',
      label: 'Student',
      minWidth: 200,
      render: (params) => {
        const student = params.row
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={student.profileImage || ''}
              sx={{ mr: 2 }}
              <Box>
                <Typography variant="body2">
                  {student.firstName} {student.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {student.email}
                </Typography>
              </Box>
          </Box>
        )
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (params) => {
        const status = params.row.status
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon(status)}
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      id: 'time',
      label: 'Time',
      minWidth: 150,
      render: (params) => (
        <Typography variant="body2">
          {new Date(params.row.scanTime).toLocaleTimeString()}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      render: (params) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.status !== 'absent' && (
            <Tooltip title="Mark as Present">
              <IconButton
                size="small"
                onClick={() => handleManualOverride({
                  studentId: params.row.student._id,
                  periodId: selectedPeriod?._id,
                  status: 'present',
                  reason: 'Marked present manually',
                })}
              >
                <CheckCircle color="success" />
              </Tooltip>
          )}
          {params.row.status === 'absent' && (
            <Tooltip title="Mark as Present">
              <IconButton
                size="small"
                onClick={() => handleManualOverride({
                  studentId: params.row.student._id,
                  periodId: selectedPeriod?._id,
                  status: 'present',
                  reason: 'Marked present manually',
                })}
              >
                <Warning color="warning" />
              </Tooltip>
          )}
          <IconButton
            size="small"
            onClick={() => handleManualOverride({
              studentId: params.row.student._id,
              periodId: selectedPeriod?._id,
              status: 'absent',
              reason: 'Mark as absent manually',
            })}
          >
            <CheckCircle color="error" />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Attendance Management
          {hasActivePeriod ? (
            <Typography variant="body2" color="text.secondary">
              Current Period: {currentPeriod?.subject?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(currentPeriod?.startTime).toLocaleTimeString()} - {new Date(currentPeriod?.endTime).toLocaleTimeString()}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No active periods found
            </Typography>
          )}
        </Typography>

        {/* Filter Options */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between': 2, mb: 2 }}>
          <Chip
            label="Filter"
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
        <Paper sx={{ height: 400, overflow: 'auto' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      padding={column.padding}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              </TableHead>
              <TableBody>
                {attendance?.attendance?.length > 0 ? (
                  attendance.map((row) => (
                    <TableRow key={row._id}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                          padding={column.padding}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.render(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <TableCell>
                        <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
                          No attendance records found for this period yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pagination */}
          {attendance?.pagination && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Showing {attendance.pagination.page} of {attendance.pagination.total} records
              </Typography>
            </Box>
          )}

          {/* Export Options */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between': 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                // Refresh attendance data
                // Implementation would refresh attendance data
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Export functionality
                // Implementation would export attendance data
              }}
            >
              Export
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Manual Override Dialog */}
      {showManualOverrideDialog && (
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0.15)',
            p: 3,
            zIndex: 1000,
            minWidth: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Manual Attendance Override
          </Typography>
          <Typography variant="body2" gutterBottom>
            Select students to manually mark attendance
          </Typography>

          {/* Student Selection */}
          <Autocomplete
            multiple
            options={[]}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName} (${option.email})`
            />
            renderInput={(params, selected) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={selected?.profileImage || ''}
                  sx={{ mr: 1 }}
                />
                <Box flexGrow={1}>
                  <Typography variant="body2">
                    {selected?.firstName} {selected?.lastName}
                  </Typography>
                </Box>
              </Box>
            )}
            renderTags={(value) =>
 (
              <Chip
                label={value}
                onDelete={() => {
                  // Remove from selected students
                  setSelectedStudents(prev =>
                    prev.filter(s => s._id !== value)
                  )
                }}
              />
            )}
          />

          {/* Override Reason */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for override"
            value={overrideData.reason}
            onChange={(e) => {
              setOverrideData(prev => ({
                ...prev,
                reason: e.target.value,
              })}
            }}
            margin="normal"
            required
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              color="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleManualOverrideSubmit}
              disabled={!overrideData.studentId || !overrideData.reason || !overrideData.status}
            >
              {overrideData.status === 'present'
                ? 'Mark Present'
                : overrideData.status === 'late'
                ? 'Mark Late'
                : 'Mark Absent'
              }
            </Button>
          </Box>
        </Paper>
      )}
    </Card>
  )
}

export default AttendanceManagement