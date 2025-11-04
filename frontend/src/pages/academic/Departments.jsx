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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  People as PeopleIcon,
} from '@mui/icons-material'

const Departments = () => {
  const [departments, setDepartments] = useState([
    {
      _id: '1',
      name: 'Computer Science and Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering',
      headName: 'Dr. Rajesh Kumar',
      teacherCount: 25,
      studentCount: 500,
      programCount: 3,
      isActive: true,
    },
    {
      _id: '2',
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology',
      headName: 'Dr. Priya Patel',
      teacherCount: 20,
      studentCount: 400,
      programCount: 2,
      isActive: true,
    },
    {
      _id: '3',
      name: 'Electronics and Communication',
      code: 'ECE',
      description: 'Department of Electronics and Communication Engineering',
      headName: 'Dr. Amit Sharma',
      teacherCount: 18,
      studentCount: 350,
      programCount: 2,
      isActive: true,
    },
  ])

  const [showDialog, setShowDialog] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headName: '',
  })

  const handleCreate = () => {
    setEditingDepartment(null)
    setFormData({ name: '', code: '', description: '', headName: '' })
    setShowDialog(true)
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description,
      headName: department.headName,
    })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (editingDepartment) {
      // Update existing department
      setDepartments(prev =>
        prev.map(dept =>
          dept._id === editingDepartment._id
            ? { ...dept, ...formData }
            : dept
        )
      )
    } else {
      // Create new department
      const newDepartment = {
        _id: Date.now().toString(),
        ...formData,
        teacherCount: 0,
        studentCount: 0,
        programCount: 0,
        isActive: true,
      }
      setDepartments(prev => [...prev, newDepartment])
    }
    setShowDialog(false)
  }

  const handleDelete = (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(dept => dept._id !== departmentId))
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Departments
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Department
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Department Head</TableCell>
                <TableCell>Teachers</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Programs</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {department.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {department.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={department.code} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{department.headName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
                      {department.teacherCount}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
                      {department.studentCount}
                    </Box>
                  </TableCell>
                  <TableCell>{department.programCount}</TableCell>
                  <TableCell>
                    <Chip
                      label={department.isActive ? 'Active' : 'Inactive'}
                      color={department.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(department)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(department._id)}
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
            {editingDepartment ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Department Name"
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
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Department Head Name"
              value={formData.headName}
              onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              {editingDepartment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default Departments