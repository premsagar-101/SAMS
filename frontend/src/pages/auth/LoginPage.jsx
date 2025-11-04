import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Google,
  Microsoft,
} from '@mui/icons-material'

import { useLogin } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const loginMutation = useLogin()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

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

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await loginMutation.mutateAsync(formData)
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleOAuthLogin = (provider) => {
    // Redirect to OAuth provider
    const oauthUrls = {
      google: 'http://localhost:3001/api/v1/auth/oauth/google',
      microsoft: 'http://localhost:3001/api/v1/auth/oauth/microsoft',
    }

    window.location.href = oauthUrls[provider]
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to SAMS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Smart Attendance Management System
            </Typography>
          </Box>

          {/* College branding */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Chip
              label="College Portal"
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Error message */}
          {loginMutation.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginMutation.error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loginMutation.isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* OAuth Login Options */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                onClick={() => handleOAuthLogin('google')}
                sx={{ textTransform: 'none' }}
              >
                Google
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Microsoft />}
                onClick={() => handleOAuthLogin('microsoft')}
                sx={{ textTransform: 'none' }}
              >
                Microsoft
              </Button>
            </Grid>
          </Grid>

          {/* Footer Links */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Sign up
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                }}
              >
                Forgot password?
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage