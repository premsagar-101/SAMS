import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material'

import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../hooks/useApi'

const SettingsPage = () => {
  const { user, updateUser } = useAuth()
  const { showNotification } = useNotifications()

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceAlerts: true,
    lowAttendanceWarnings: true,
    classReminders: true,
    systemUpdates: false,
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  })

  const [privacySettings, setPrivacySettings] = useState({
    shareAttendanceData: false,
    allowLocationTracking: true,
    showProfileToOthers: true,
    dataRetentionDays: 90,
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const handleProfileChange = (field) => (event) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleNotificationChange = (field) => (event) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

  const handlePrivacyChange = (field) => (event) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

  const handleSelectChange = (field) => (event) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      await updateUser(profileData)
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error',
      })
    }
  }

  const handleSaveNotifications = async () => {
    try {
      // API call to save notification preferences
      setSnackbar({
        open: true,
        message: 'Notification preferences saved!',
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save notification preferences.',
        severity: 'error',
      })
    }
  }

  const handleSavePrivacy = async () => {
    try {
      // API call to save privacy settings
      setSnackbar({
        open: true,
        message: 'Privacy settings saved!',
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save privacy settings.',
        severity: 'error',
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Profile Settings
                </Typography>
              </Box>

              {/* Profile Picture */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={profileData.profileImage}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                </Avatar>
                <Button
                  variant="outlined"
                  startIcon={<CameraIcon />}
                  size="small"
                >
                  Change Photo
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={handleProfileChange('firstName')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={handleProfileChange('lastName')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange('email')}
                    margin="normal"
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={handleProfileChange('phone')}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                >
                  Save Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Notification Preferences
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onChange={handleNotificationChange('pushNotifications')}
                    />
                  }
                  label="Push Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.attendanceAlerts}
                      onChange={handleNotificationChange('attendanceAlerts')}
                    />
                  }
                  label="Attendance Alerts"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.lowAttendanceWarnings}
                      onChange={handleNotificationChange('lowAttendanceWarnings')}
                    />
                  }
                  label="Low Attendance Warnings"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.classReminders}
                      onChange={handleNotificationChange('classReminders')}
                    />
                  }
                  label="Class Reminders"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onChange={handleNotificationChange('systemUpdates')}
                    />
                  }
                  label="System Updates"
                />

                <Divider sx={{ my: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.quietHours}
                      onChange={handleNotificationChange('quietHours')}
                    />
                  }
                  label="Quiet Hours"
                />

                {notificationSettings.quietHours && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={notificationSettings.quietHoursStart}
                        onChange={handleSelectChange('quietHoursStart')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={notificationSettings.quietHoursEnd}
                        onChange={handleSelectChange('quietHoursEnd')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveNotifications}
                >
                  Save Preferences
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Privacy & Security
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={privacySettings.shareAttendanceData}
                      onChange={handlePrivacyChange('shareAttendanceData')}
                    />
                  }
                  label="Share attendance data with teachers"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={privacySettings.allowLocationTracking}
                      onChange={handlePrivacyChange('allowLocationTracking')}
                    />
                  }
                  label="Allow location tracking for attendance"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={privacySettings.showProfileToOthers}
                      onChange={handlePrivacyChange('showProfileToOthers')}
                    />
                  }
                  label="Show profile to other students"
                />

                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Data Retention Period</InputLabel>
                    <Select
                      value={privacySettings.dataRetentionDays}
                      onChange={(e) => setPrivacySettings(prev => ({
                        ...prev,
                        dataRetentionDays: e.target.value
                      }))}
                      label="Data Retention Period"
                    >
                      <MenuItem value={30}>30 days</MenuItem>
                      <MenuItem value={60}>60 days</MenuItem>
                      <MenuItem value={90}>90 days</MenuItem>
                      <MenuItem value={180}>180 days</MenuItem>
                      <MenuItem value={365}>1 year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Your location data is only used for attendance validation and is encrypted for privacy.
                </Alert>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSavePrivacy}
                >
                  Save Privacy Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth>
                  Change Password
                </Button>
                <Button variant="outlined" fullWidth>
                  Download My Data
                </Button>
                <Button variant="outlined" fullWidth>
                  Export Attendance History
                </Button>
                <Button variant="outlined" fullWidth color="error">
                  Delete Account
                </Button>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                Deleting your account is permanent and cannot be undone.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SettingsPage