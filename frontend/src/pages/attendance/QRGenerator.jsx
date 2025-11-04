import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Stop as StopIcon,
  ContentCopy as CopyIcon,
  AccessTime as TimerIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'

import { useCurrentPeriods } from '../../hooks/useApi'
import { useGenerateQR } from '../../hooks/useApi'

const QRGenerator = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [copied, setCopied] = useState(false)

  const { data: currentPeriods } = useCurrentPeriods()
  const { mutate: generateQR, isPending: isGenerating } = useGenerateQR()

  // Auto-select first available period
  useEffect(() => {
    if (currentPeriods && currentPeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(currentPeriods[0])
    }
  }, [currentPeriods, selectedPeriod])

  // Countdown timer
  useEffect(() => {
    if (qrData && qrData.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(qrData.expiresAt).getTime()
        const remaining = Math.max(0, expiry - now)

        if (remaining <= 0) {
          setQrData(null)
          setTimeRemaining(0)
        } else {
          setTimeRemaining(Math.floor(remaining / 1000))
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [qrData])

  const handleGenerateQR = () => {
    if (!selectedPeriod) return

    generateQR(
      { periodId: selectedPeriod._id },
      {
        onSuccess: (data) => {
          setQrData(data)
          setTimeRemaining(Math.floor((new Date(data.expiresAt).getTime() - new Date().getTime()) / 1000))
        },
        onError: (error) => {
          console.error('Failed to generate QR:', error)
        }
      }
    )
  }

  const handleStopQR = () => {
    setQrData(null)
    setTimeRemaining(0)
  }

  const handleCopyQRData = () => {
    if (qrData?.qrData) {
      navigator.clipboard.writeText(qrData.qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressValue = () => {
    if (!qrData) return 0
    const totalTime = new Date(qrData.expiresAt).getTime() - new Date(qrData.generatedAt).getTime()
    const elapsed = new Date().getTime() - new Date(qrData.generatedAt).getTime()
    return Math.min(100, Math.max(0, 100 - (elapsed / totalTime) * 100))
  }

  const isExpired = qrData && new Date() > new Date(qrData.expiresAt)

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          QR Code Generator
        </Typography>

        {/* Current Period Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select Period:
          </Typography>
          {currentPeriods && currentPeriods.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentPeriods.map((period) => (
                <Chip
                  key={period._id}
                  label={`${period.subject?.name} - ${new Date(period.startTime).toLocaleTimeString()}`}
                  onClick={() => setSelectedPeriod(period)}
                  color={selectedPeriod?._id === period._id ? 'primary' : 'default'}
                  clickable
                  size="small"
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No current periods available. Please check your schedule.
            </Alert>
          )}
        </Box>

        {/* Selected Period Info */}
        {selectedPeriod && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Period:
            </Typography>
            <Typography variant="body2">
              <strong>Subject:</strong> {selectedPeriod.subject?.name}
            </Typography>
            <Typography variant="body2">
              <strong>Time:</strong> {new Date(selectedPeriod.startTime).toLocaleTimeString()} -{' '}
              {new Date(selectedPeriod.endTime).toLocaleTimeString()}
            </Typography>
            <Typography variant="body2">
              <strong>Room:</strong> {selectedPeriod.room}
            </Typography>
          </Box>
        )}

        {/* QR Generation Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          {!qrData ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateQR}
              disabled={!selectedPeriod || isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="large"
              onClick={handleStopQR}
              startIcon={<StopIcon />}
              color="error"
            >
              Stop QR Session
            </Button>
          )}
        </Box>

        {/* QR Code Display */}
        {qrData && qrData.qrImage && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <img
                src={qrData.qrImage}
                alt="QR Code"
                style={{
                  maxWidth: '300px',
                  width: '100%',
                  height: 'auto',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                }}
              />
            </Box>

            {/* Countdown Timer */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TimerIcon color={timeRemaining < 30 ? 'error' : 'primary'} />
                <Typography variant="h4" color={timeRemaining < 30 ? 'error' : 'primary'}>
                  {formatTimeRemaining(timeRemaining)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                color={timeRemaining < 30 ? 'error' : 'primary'}
                sx={{ width: '100%', mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                QR Code expires in {formatTimeRemaining(timeRemaining)}
              </Typography>
            </Box>

            {/* Copy QR Data */}
            <Box sx={{ mb: 2 }}>
              <Tooltip title={copied ? 'Copied!' : 'Copy QR data'}>
                <IconButton
                  onClick={handleCopyQRData}
                  color={copied ? 'success' : 'default'}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* Session Statistics */}
        {qrData && (
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {qrData.totalScans || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Scans
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {qrData.uniqueStudents || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unique Students
              </Typography>
            </Box>
          </Box>
        )}

        {/* Expiry Message */}
        {isExpired && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              QR Code has expired. Please generate a new one.
            </Typography>
          </Alert>
        )}

        {/* Instructions */}
        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Instructions:
          </Typography>
          <Typography variant="body2" component="div">
            <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Select the current class period from above</li>
              <li>Click "Generate QR Code" to create a time-bound QR code</li>
              <li>Students scan the QR code to mark attendance</li>
              <li>QR code automatically expires after {process.env.REACT_APP_QR_EXPIRY_MINUTES || 3} minutes</li>
              <li>Monitor real-time statistics below</li>
            </ol>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QRGenerator