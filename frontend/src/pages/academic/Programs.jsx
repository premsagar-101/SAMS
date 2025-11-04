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
  School as SchoolIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'

const Programs = () => {
  const [programs, setPrograms] = useState([
    {
      _id: '1',
      name: 'B.Tech Computer Science and Engineering',
      code: 'BTCS',
      duration: 4,
      totalSemesters: 8,
      departmentId: '1',
      departmentName: 'Computer Science and Engineering',
      description: 'Bachelor of Technology in Computer Science and Engineering',
      isActive: true,
    },
    {
      _id: '2',
      name: 'B.Tech Information Technology',
      code: 'BTIT',
      duration: 4,
      totalSemesters: 8,
      departmentId: '2',
      departmentName: 'Information Technology',
      description: 'Bachelor of Technology in Information Technology',
      isActive: true,
    },
    {
      _id: '3',
      name: 'M.Tech Computer Science',
      code: 'MTCS',
      duration: 2,
      totalSemesters: 4,
      departmentId: '1',
      departmentName: 'Computer Science and Engineering',
      description: 'Master of Technology in Computer Science',
      isActive: true,
    },
  ])

  const departments = [
    { _id: '1', name: 'Computer Science and Engineering' },
    { _id: '2', name: 'Information Technology' },
    { _id: '3', name: 'Electronics and Communication' },
  ]

  const [showDialog, setShowDialog] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    duration: 4,
    totalSemesters: 8,
    departmentId: '',
    description: '',
  })

  const handleCreate = () => {
    setEditingProgram(null)
    setFormData({ name: '', code: '', duration: 4, totalSemesters: 8, departmentId: '', description: '' })
    setShowDialog(true)
  }

  const handleEdit = (program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      code: program.code,
      duration: program.duration,
      totalSemesters: program.totalSemesters,
      departmentId: program.departmentId,
      description: program.description,
    })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (editingProgram) {
      // Update existing program
      setPrograms(prev =>
        prev.map(prog =>
          prog._id === editingProgram._id
            ? {
                ...prog,
                ...formData,
                departmentName: departments.find(d => d._id === formData.departmentId)?.name || ''
              }
            : prog
        )
      )
    } else {
      // Create new program
      const newProgram = {
        _id: Date.now().toString(),
        ...formData,
        departmentName: departments.find(d => d._id === formData.departmentId)?.name || '',
        isActive: true,
      }
      setPrograms(prev => [...prev, newProgram])
    }
    setShowDialog(false)
  }

  const handleDelete = (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      setPrograms(prev => prev.filter(prog => prog._id !== programId))
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Academic Programs
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Program
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Program Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Semesters</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {program.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {program.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={program.code} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{program.departmentName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                      {program.duration} years
                    </Box>
                  </TableCell>
                  <TableCell>{program.totalSemesters}</TableCell>
                  <TableCell>
                    <Chip
                      label={program.isActive ? 'Active' : 'Inactive'}
                      color={program.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(program)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(program._id)}
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
            {editingProgram ? 'Edit Program' : 'Add Program'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Program Name"
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
              label="Duration (Years)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Total Semesters"
              type="number"
              value={formData.totalSemesters}
              onChange={(e) => setFormData({ ...formData, totalSemesters: parseInt(e.target.value) })}
              margin="normal"
              required
            />
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
              {editingProgram ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default Programs