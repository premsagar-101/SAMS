import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  QrCodeScanner as QrCodeIcon,
  QrCode as QrCodeGeneratorIcon,
  History as HistoryIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Department as DepartmentIcon,
  Class as ClassIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material'

import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useApi'
import Sidebar from './Sidebar'

const DRAWER_WIDTH = 280

const Layout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const { user, logout, getFullName } = useAuth()
  const { data: notifications } = useNotifications({ limit: 5, unreadOnly: true })
  const { mutate: markNotificationsRead } = useMarkNotificationsRead()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleProfileMenuClose()
    logout()
  }

  // Get menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ]

    const roleBasedItems = []

    if (user?.role === 'student') {
      roleBasedItems.push(
        { text: 'QR Scanner', icon: <QrCodeIcon />, path: '/qr-scanner' },
        { text: 'Attendance History', icon: <HistoryIcon />, path: '/attendance-history' }
      )
    }

    if (user?.role === 'teacher') {
      roleBasedItems.push(
        { text: 'QR Generator', icon: <QrCodeGeneratorIcon />, path: '/qr-generator' },
        { text: 'Attendance Management', icon: <ClassIcon />, path: '/attendance-management' },
        { text: 'Timetable', icon: <CalendarIcon />, path: '/timetable' },
        { text: 'Reports', icon: <ReportsIcon />, path: '/reports/attendance' }
      )
    }

    if (user?.role === 'hod') {
      roleBasedItems.push(
        { text: 'Departments', icon: <DepartmentIcon />, path: '/departments' },
        { text: 'Programs', icon: <SchoolIcon />, path: '/programs' },
        { text: 'Subjects', icon: <ClassIcon />, path: '/subjects' },
        { text: 'Timetable', icon: <CalendarIcon />, path: '/timetable' },
        { text: 'Attendance Management', icon: <ClassIcon />, path: '/attendance-management' },
        { text: 'Reports', icon: <ReportsIcon />, path: '/reports/students' }
      )
    }

    if (user?.role === 'admin') {
      roleBasedItems.push(
        { text: 'Departments', icon: <DepartmentIcon />, path: '/departments' },
        { text: 'Programs', icon: <SchoolIcon />, path: '/programs' },
        { text: 'Subjects', icon: <ClassIcon />, path: '/subjects' },
        { text: 'Timetable', icon: <CalendarIcon />, path: '/timetable' },
        { text: 'Reports', icon: <ReportsIcon />, path: '/reports/teachers' }
      )
    }

    return [...baseItems, ...roleBasedItems]
  }

  const handleNotificationClick = () => {
    // Mark notifications as read when clicking on notifications
    if (notifications && notifications.length > 0) {
      const notificationIds = notifications.map(n => n._id)
      markNotificationsRead({ notificationIds })
    }
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          SAMS
        </Typography>
      </Toolbar>
      <Divider />
      <Sidebar menuItems={getMenuItems()} />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Smart Attendance Management System
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={notifications?.length || 0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                alt={getFullName()}
                src={user?.profileImage}
                sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
              >
                {getFullName().charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
              <MenuItem onClick={() => { handleProfileMenuClose(); window.location.href = '/profile' }}>
                <Avatar
                  sx={{ width: 24, height: 24, mr: 2 }}
                  src={user?.profileImage}
                >
                  {getFullName().charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2">{getFullName()}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* The implementation can be swapped with js to avoid watermarking in the build */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8, // AppBar height
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout