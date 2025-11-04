import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  Badge,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Success as SuccessIcon,
} from '@mui/icons-material'

import { useNotifications } from '../../hooks/useApi'

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMenu, setFilterMenu] = useState(null)
  const [selectedNotifications, setSelectedNotifications] = useState([])

  const {
    data: notifications,
    isLoading,
    mutate: refetchNotifications,
  } = useNotifications()

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleFilterClick = (event) => {
    setFilterMenu(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterMenu(null)
  }

  const handleMarkAsRead = (notificationId) => {
    // API call to mark notification as read
    console.log('Mark as read:', notificationId)
  }

  const handleMarkAllAsRead = () => {
    // API call to mark all notifications as read
    console.log('Mark all as read')
  }

  const handleDeleteNotification = (notificationId) => {
    // API call to delete notification
    console.log('Delete notification:', notificationId)
  }

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleBulkAction = (action) => {
    // Handle bulk actions (mark as read, delete, etc.)
    console.log('Bulk action:', action, selectedNotifications)
    setSelectedNotifications([])
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />
      case 'warning':
        return <WarningIcon color="warning" />
      case 'error':
        return <ErrorIcon color="error" />
      default:
        return <InfoIcon color="info" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'info'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filterNotifications = (notifications) => {
    if (!notifications) return []

    let filtered = notifications

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter(n => !n.isRead)
    } else if (activeTab === 2) {
      filtered = filtered.filter(n => n.category === 'attendance')
    } else if (activeTab === 3) {
      filtered = filtered.filter(n => n.category === 'system')
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredNotifications = filterNotifications(notifications?.notifications || [])
  const unreadCount = notifications?.unreadCount || 0

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Notifications
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="primary"
              sx={{ ml: 2 }}
            >
              <NotificationsIcon />
            </Badge>
          )}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<MarkReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton onClick={handleFilterClick}>
              <FilterIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenu}
        open={Boolean(filterMenu)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={handleFilterClose}>All Types</MenuItem>
        <MenuItem onClick={handleFilterClose}>Attendance</MenuItem>
        <MenuItem onClick={handleFilterClose}>System</MenuItem>
        <MenuItem onClick={handleFilterClose}>Reminders</MenuItem>
      </Menu>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Attendance" />
          <Tab label="System" />
        </Tabs>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || activeTab !== 0
                  ? 'Try adjusting your filters or search terms'
                  : 'You\'re all caught up!'
                }
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  sx={{
                    borderLeft: notification.isRead ? 'none' : '4px solid',
                    borderLeftColor: getNotificationColor(notification.type) + '.main',
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteNotification(notification._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.category}
                          size="small"
                          variant="outlined"
                          color={getNotificationColor(notification.type)}
                        />
                        {!notification.isRead && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.createdAt)}
                          </Typography>
                          {!notification.isRead && (
                            <Button
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      {filteredNotifications.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="outlined">
            Load More Notifications
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default NotificationsPage