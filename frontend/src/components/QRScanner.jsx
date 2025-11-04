import React, { useState, useCallback } from 'react'
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material'
import { QrScanner } from '@yudiel/react-qr-scanner'
import { useScanQR } from '../hooks/useApi'

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const { mutate: scanQR, isPending: isScanningQR } = useScanQR()

  const handleScan = useCallback((result) => {
    if (result) {
      setIsScanning(false)

      // Get location for attendance validation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            }

            // Generate device fingerprint
            const deviceFingerprint = generateDeviceFingerprint()

            // Get IP address (in production, this would be handled by backend)
            const ipAddress = await getIPAddress()

            scanQR({
              qrData: result,
              location: locationData,
              deviceFingerprint,
              ipAddress
            }, {
              onSuccess: (data) => {
                onScanSuccess?.(data)
              },
              onError: (error) => {
                onScanError?.(error)
              }
            })
          },
          (error) => {
            onScanError?.({ message: 'Location access denied. Please enable location services.' })
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      } else {
        onScanError?.({ message: 'Geolocation is not supported by this browser.' })
      }
    }
  }, [scanQR, onScanSuccess, onScanError])

  const handleError = useCallback((error) => {
    console.error('QR Scanner Error:', error)
    setCameraError(error.message || 'Camera access denied')
    setIsScanning(false)
  }, [])

  const startScanning = () => {
    setIsScanning(true)
    setCameraError(null)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  // Generate device fingerprint
  const generateDeviceFingerprint = () => {
    const nav = window.navigator
    const screen = window.screen
    const fingerprint = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency,
      nav.platform
    ].join('|')

    return btoa(fingerprint).substring(0, 32)
  }

  // Get IP address (simplified version)
  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      {!isScanning ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            QR Code Scanner
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Position the QR code within the camera frame to scan
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={startScanning}
            disabled={isScanningQR}
            startIcon={isScanningQR ? <CircularProgress size={20} /> : null}
            fullWidth
          >
            {isScanningQR ? 'Processing...' : 'Start Scanning'}
          </Button>
        </Box>
      ) : (
        <Box>
          <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
            <QrScanner
              onDecode={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment'
              }}
              scanDelay={500
            }
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none'
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={stopScanning}
            fullWidth
          >
            Stop Scanning
          </Button>
        </Box>
      </Box>
      )}

      {cameraError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Camera Error: {cameraError}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Please ensure camera permissions are granted and try again.
          </Typography>
        </Alert>
      )}

      {!isScanning && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Instructions:
          </Typography>
          <Typography variant="body2" component="div">
            <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Enable camera permissions when prompted</li>
              <li>Enable location services for attendance validation</li>
              <li>Position QR code within the camera frame</li>
              <li>Wait for automatic scan and processing</li>
            </ol>
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default QRScanner