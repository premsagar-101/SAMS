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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  School as SchoolIcon,
} from '@mui/icons-material'

const Subjects = () => {
  const [subjects, setSubjects] = useState([
    {
      _id: '1',
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      credits: 4,
      type: 'Core',
      departmentId: '1',
      departmentName: 'Computer Science and Engineering',
      semester: '3',
      description: 'Study of data structures and algorithmic techniques',
      isActive: true,
    },
    {
      _id: '2',
      name: 'Database Management Systems',
      code: 'CS202',
      credits: 4,
      type: 'Core',
      departmentId: '1',
      departmentName: 'Computer Science and Engineering',
      semester: '3',
      description: 'Database design and SQL programming',
      isActive: true,
    },
    {
      _id: '3',
      name: 'Web Development',
      code: 'CS203',
      credits: 3,
      type: 'Elective',
      departmentId: '1',
      departmentName: 'Computer Science and Engineering',
      semester: '4',
      description: 'Modern web development technologies',
      isActive: true,
    },
    {
      _id: '4',
      name: 'Operating Systems',
      code: 'CS204',
      credits: 4,
      type: 'Core',
      departmentId: '1',
      departmentName: 'Computer Science and Engineering',
      semester: '4',
      description: 'Operating system concepts and principles',
      isActive: true,
    },
  ])

  const departments = [
    { _id: '1', name: 'Computer Science and Engineering' },
    { _id: '2', name: 'Information Technology' },
    { _id: '3', name: 'Electronics and Communication' },
  ]

  const [showDialog, setShowDialog] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    type: 'Core',
    departmentId: '',
    semester: '1',
    description: '',
  })

  const handleCreate = () => {
    setEditingSubject(null)
    setFormData({ name: '', code: '', credits: 3, type: 'Core', departmentId: '', semester: '1', description: '' })
    setShowDialog(true)
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      type: subject.type,
      departmentId: subject.departmentId,
      semester: subject.semester,
      description: subject.description,
    })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (editingSubject) {
      // Update existing subject
      setSubjects(prev =>
        prev.map(subj =>
          subj._id === editingSubject._id
            ? {
                ...subj,
                ...formData,
                departmentName: departments.find(d => d._id === formData.departmentId)?.name || ''
              }
            : subj
        )
      )
    } else {
      // Create new subject
      const newSubject = {
        _id: Date.now().toString(),
        ...formData,
        departmentName: departments.find(d => d._id === formData.departmentId)?.name || '',
        isActive: true,
      }
      setSubjects(prev => [...prev, newSubject])
    }
    setShowDialog(false)
  }

  const handleDelete = (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(prev => prev.filter(subj => subj._id !== subjectId))
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Core':
        return 'primary'
      case 'Elective':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Subjects
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Subject
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {subject.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {subject.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={subject.code} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1, fontSize: 16 }} />
                      {subject.departmentName}
                    </Box>
                  </TableCell>
                  <TableCell>Semester {subject.semester}</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>
                    <Chip
                      label={subject.type}
                      color={getTypeColor(subject.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={subject.isActive ? 'Active' : 'Inactive'}
                      color={subject.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(subject)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(subject._id)}
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
            {editingSubject ? 'Edit Subject' : 'Add Subject'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Subject Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Department"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              margin="normal"
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              margin="normal"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <MenuItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="Core">Core</MenuItem>
              <MenuItem value="Elective">Elective</MenuItem>
              <MenuItem value="Lab">Lab</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              {editingSubject ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default Subjects