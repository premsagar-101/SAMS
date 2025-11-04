import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Typography,
  Grid,
  Alert,
  Chip,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'

import { useTeacherReports } from '../../hooks/useApi'
import { useDepartment } from '../../hooks/useApi'
import { useNotifications } from '../../hooks/useApi'
import { useCurrentPeriods } from '../../hooks/useApi'

const TeacherReports = () => {
  const { data: teacherReports } = useTeacherReports()
  const { departments } = useDepartment()
  const { departments } = useDepartments()

  const getTeacherStats = (departmentId) => {
    const dept = departments.find(dept => dept._id === departmentId)
    return dept ? {
      teacherCount: dept.teacherCount || 0,
      studentCount: dept.studentCount || 0,
      avgClassSize: dept.avgClassSize || 0,
    }
  } else {
      { teacherCount: 0, studentCount: 0, avgClassSize: 0 }
    }
  }

  const getDepartmentStats = () => {
    const { departments } = useDepartments()
    return {
      totalDepartments: departments.length,
      activeDepartments: departments.filter(dept => dept.isActive).length,
      totalStudents: departments.reduce((sum, dept) => sum(dept.studentCount || 0),
    }
  }

  const getLowAttendanceStudents = () => {
    const { data: teacherReports } = useTeacherReports({
    const { data: lowAttendance } = useReports({
      params: { limit: 50 },
    })
    return {
      students: data.lowAttendance?.students || []
    }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Department Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {getDepartmentStats().activeDepartments} Active Departments ({ count: deptStats.activeDepartments })
              </CardContent>
          </Card>
        </Grid>

        {/* Teacher Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Teacher Statistics
              </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getTeacherStats().totalClassesTaught} classes
                </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Student Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Performance
              </Typography variant="body2" color="text.secondary">
                {getAttendanceStats().percentage}% average attendance rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography variant="body2" color="text.secondary">
                {getAttendanceStats()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Performance
              </Typography variant="body2" color="text.secondary">
                {getAttendanceStats()}
              </Typography variant="body2" color="text.secondary">
                Present: {getAttendanceStats().present}/{getAttendanceStats().total}
              </Typography variant="body2" color="text.secondary">
                Absent: {getAttendanceStats().absent}/{getAttendanceStats().total}
              </Typography variant="body2" color="text.secondary">
                Present: {getAttendanceStats().present}/{getAttendanceStats().total}
              </Typography variant="body2" color="text.secondary">
                Late: {getAttendanceStats().late}/{getAttendanceStats().total}
              </Typography variant="body2" color="text.secondary">
                Absent: {getAttendanceStats().absent}/{getAttendanceStats().total}
              </Typography variant="body2" color="text.secondary">
                Present: {getAttendanceStats().present}/{getAttendanceStats().total}
              </Typography variant="body2" color="text.secondary">
                Late: {getAttendanceStats().late}/{getAttendanceStats().total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography variant="body2" color="text.secondary">
                {getAttendanceStats()}
              </Typography variant="body2" color="text.secondary">
                {getAttendanceStats().total} classes attended this month
              </Typography variant="body2" color="text.secondary">
                {getAttendanceStats().percentage} average attendance rate
              </Typography variant="body2" color="text.secondary">
                This month: {getAttendanceStats().total} classes attended
              </Typography variant="body" color="text.secondary">
                {getAttendanceStats().percentage}% attendance rate this month
              </Typography variant="body" color="text.secondary">
                {getAttendanceStats().late}/{getAttendanceStats().total} classes absent
              </Typography variant="body" color="text.secondary">
                {getAttendanceStats().total} classes missed
              </Typography variant="body" color="text.secondary">
                {getAttendanceStats().percentage}% average attendance rate
              </Typography variant="body" color="text-secondary">
                {getAttendanceStats().percentage}% attendance rate this month
              </Typography>
            </Typography variant="body" color="text.secondary">
                You have {getAttendanceStats().percentage}% average attendance for this month
              </Typography>
            </Typography variant="body" color="text-secondary">
                You have good attendance
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notifications?.unreadCount || 0} unread notifications
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      </Grid>
    </Box>
  )
}

export default StudentReports