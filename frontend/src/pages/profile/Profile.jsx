import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material'
import { Edit as EditIcon, PhotoCamera as CameraIcon } from '@mui/icons-material'

import { useAuth } from '../../hooks/useAuth'
import { useUpdateProfile } from '../../hooks/useApi'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const updateProfileMutation = useUpdateProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^[+]?[\d\s-()]*$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateProfileMutation.mutateAsync(formData)
      updateUser(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || '',
    })
    setErrors({})
    setIsEditing(false)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Profile Information
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={formData.profileImage}
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                mr: 3,
              }}
            >
              {formData.firstName.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5">
                {formData.firstName} {formData.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.phone || 'No phone number'}
              </Typography>
              <Chip
                label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          {updateProfileMutation.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateProfileMutation.error.response?.data?.error || 'Failed to update profile'}
            </Alert>
          )}

          {updateProfileMutation.isSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                disabled={!isEditing}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                disabled={!isEditing}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                disabled={true}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={!isEditing}
                placeholder="+1 (234) 567-8900"
              />
            </Grid>

            {isEditing && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ position: 'relative' }}
                  >
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <CameraIcon sx={{ mr: 1 }} />
                    Upload Photo
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    {formData.profileImage ? 'Change' : 'Upload'} profile picture
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={updateProfile.isLoading}
                  startIcon={updateProfileMutation.isLoading && <CircularProgress size={20} />}
                >
                  {updateProfile.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Profile