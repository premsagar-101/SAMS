import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
} from '@mui/icons-material'

const Timetable = () => {
  const [timetable, setTimetable] = useState([
    {
      _id: '1',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:30',
      subjectName: 'Data Structures and Algorithms',
      subjectCode: 'CS201',
      teacherName: 'Prof. Amit Sharma',
      room: 'CS-301',
      departmentName: 'Computer Science and Engineering',
      semester: '3',
    },
    {
      _id: '2',
      dayOfWeek: 1,
      startTime: '11:00',
      endTime: '12:30',
      subjectName: 'Database Management Systems',
      subjectCode: 'CS202',
      teacherName: 'Dr. Priya Patel',
      room: 'CS-302',
      departmentName: 'Computer Science and Engineering',
      semester: '3',
    },
    {
      _id: '3',
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '10:30',
      subjectName: 'Operating Systems',
      subjectCode: 'CS204',
      teacherName: 'Prof. John Smith',
      room: 'CS-303',
      departmentName: 'Computer Science and Engineering',
      semester: '4',
    },
  ])

  const subjects = [
    { _id: '1', name: 'Data Structures and Algorithms', code: 'CS201' },
    { _id: '2', name: 'Database Management Systems', code: 'CS202' },
    { _id: '3', name: 'Operating Systems', code: 'CS204' },
    { _id: '4', name: 'Web Development', code: 'CS203' },
  ]

  const teachers = [
    { _id: '1', name: 'Prof. Amit Sharma' },
    { _id: '2', name: 'Dr. Priya Patel' },
    { _id: '3', name: 'Prof. John Smith' },
    { _id: '4', name: 'Dr. Sarah Johnson' },
  ]

  const rooms = ['CS-301', 'CS-302', 'CS-303', 'CS-304', 'Lab-1', 'Lab-2']

  const days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ]

  const [showDialog, setShowDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    subjectId: '',
    teacherId: '',
    room: '',
    semester: '1',
  })

  const handleCreate = () => {
    setEditingEntry(null)
    setFormData({
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      subjectId: '',
      teacherId: '',
      room: '',
      semester: '1',
    })
    setShowDialog(true)
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setFormData({
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subjectId || '',
      teacherId: entry.teacherId || '',
      room: entry.room,
      semester: entry.semester,
    })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (editingEntry) {
      // Update existing entry
      setTimetable(prev =>
        prev.map(entry =>
          entry._id === editingEntry._id
            ? {
                ...entry,
                ...formData,
                subjectName: subjects.find(s => s._id === formData.subjectId)?.name || '',
                subjectCode: subjects.find(s => s._id === formData.subjectId)?.code || '',
                teacherName: teachers.find(t => t._id === formData.teacherId)?.name || '',
              }
            : entry
        )
      )
    } else {
      // Create new entry
      const newEntry = {
        _id: Date.now().toString(),
        ...formData,
        subjectName: subjects.find(s => s._id === formData.subjectId)?.name || '',
        subjectCode: subjects.find(s => s._id === formData.subjectId)?.code || '',
        teacherName: teachers.find(t => t._id === formData.teacherId)?.name || '',
        departmentName: 'Computer Science and Engineering',
      }
      setTimetable(prev => [...prev, newEntry])
    }
    setShowDialog(false)
  }

  const handleDelete = (entryId) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      setTimetable(prev => prev.filter(entry => entry._id !== entryId))
    }
  }

  const getDayLabel = (dayValue) => {
    const day = days.find(d => d.value === dayValue)
    return day ? day.label : 'Unknown'
  }

  const groupByDay = () => {
    const grouped = {}
    timetable.forEach(entry => {
      if (!grouped[entry.dayOfWeek]) {
        grouped[entry.dayOfWeek] = []
      }
      grouped[entry.dayOfWeek].push(entry)
    })
    return grouped
  }

  const groupedTimetable = groupByDay()

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Timetable Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Schedule
          </Button>
        </Box>

        {/* Weekly Schedule View */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {days.map((day) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={day.value}>
              <Paper sx={{ p: 2, minHeight: 200, bgcolor: day.value === 6 ? 'grey.50' : 'white' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {day.label}
                </Typography>
                {groupedTimetable[day.value] ? (
                  groupedTimetable[day.value].map((entry) => (
                    <Box key={entry._id} sx={{ mb: 1, p: 1, border: '1px solid #ddd', borderRadius: 1, bgcolor: 'background.paper' }}>
                      <Typography variant="caption" fontWeight="medium">
                        {entry.startTime} - {entry.endTime}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {entry.subjectCode}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {entry.room}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No classes scheduled
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Detailed Table View */}
        <Typography variant="h6" gutterBottom>
          Detailed Schedule
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timetable.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{getDayLabel(entry.dayOfWeek)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon sx={{ mr: 1, fontSize: 16 }} />
                      {entry.startTime} - {entry.endTime}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {entry.subjectName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.subjectCode}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{entry.teacherName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RoomIcon sx={{ mr: 1, fontSize: 16 }} />
                      {entry.room}
                    </Box>
                  </TableCell>
                  <TableCell>Semester {entry.semester}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(entry)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(entry._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingEntry ? 'Edit Schedule' : 'Add Schedule'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Day"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
              margin="normal"
              required
            >
              {days.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Subject"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              margin="normal"
              required
            >
              {subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Teacher"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              margin="normal"
              required
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              margin="normal"
              required
            >
              {rooms.map((room) => (
                <MenuItem key={room} value={room}>
                  {room}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              {editingEntry ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default Timetable