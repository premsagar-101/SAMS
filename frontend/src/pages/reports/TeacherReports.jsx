import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
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
  const { data: notifications } = useNotifications()

  const getTeacherStats = (departmentId) => {
    const dept = departments.find(dept => dept._id === departmentId)
    return dept ? {
      teacherCount: dept.teacherCount || 0,
      studentCount: dept.studentCount || 0,
      avgClassSize: dept.avgClassSize || 0,
    } : {
      teacherCount: 0,
      studentCount: 0,
      avgClassSize: 0
    }
  }

  const getDepartmentStats = () => {
    return {
      totalDepartments: departments.length,
      activeDepartments: departments.filter(dept => dept.isActive).length,
      totalStudents: departments.reduce((sum, dept) => sum + (dept.studentCount || 0), 0)
    }
  }

  const getLowAttendanceStudents = () => {
    return {
      students: teacherReports?.lowAttendance?.students || []
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
                Department Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getDepartmentStats().activeDepartments} Active Departments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students: {getDepartmentStats().totalStudents}
              </Typography>
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
 Total Classes Taught: {teacherReports?.totalClasses || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Attendance: {teacherReports?.avgAttendance || 0}%
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
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Attendance Rate: {teacherReports?.avgStudentAttendance || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Attendance Students: {getLowAttendanceStudents().students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notifications?.unreadCount || 0} unread notifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TeacherReports