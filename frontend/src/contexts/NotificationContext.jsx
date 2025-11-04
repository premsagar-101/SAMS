import React, { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { notificationAPI } from '../services/api'

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
}

// Create context
const NotificationContext = createContext()

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, setState] = useState(initialState)
  const [socket, setSocket] = useState(null)

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
    })

    newSocket.on('connect', () => {
      console.log('Connected to notification server')
      setState(prev => ({ ...prev, isConnected: true }))
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification server')
      setState(prev => ({ ...prev, isConnected: false }))
    })

    newSocket.on('notification', (notification) => {
      // Add new notification to state
      setState(prev => ({
        ...prev,
        notifications: [notification, ...prev.notifications],
        unreadCount: prev.unreadCount + 1,
      }))

      // Show toast notification
      toast.success(notification.title, {
        duration: 4000,
        icon: notification.type === 'error' ? '❌' : '✅',
      })
    })

    newSocket.on('notification_read', (notificationId) => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getNotifications({ limit: 50 })
        const notifications = response.data.notifications
        const unreadCount = response.data.unreadCount

        setState(prev => ({
          ...prev,
          notifications,
          unreadCount,
        }))
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()
  }, [])

  // Fetch notifications function
  const fetchNotifications = async (options = {}) => {
    try {
      const response = await notificationAPI.getNotifications(options)
      const notifications = response.data.notifications
      const unreadCount = response.data.unreadCount

      setState(prev => ({
        ...prev,
        notifications: options.page === 1 ? notifications : [...prev.notifications, ...notifications],
        unreadCount,
      }))

      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  }

  // Mark notifications as read
  const markAsRead = async (notificationIds) => {
    try {
      await notificationAPI.markAsRead({ notificationIds })

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          notificationIds.includes(n._id) ? { ...n, isRead: true, readAt: new Date() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - notificationIds.length),
      }))

      // Also emit via socket if connected
      if (socket) {
        notificationIds.forEach(id => {
          socket.emit('mark_notification_read', { notificationId: id })
        })
      }

      return true
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
      throw error
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = state.notifications.filter(n => !n.isRead)
      const notificationIds = unreadNotifications.map(n => n._id)

      if (notificationIds.length === 0) return

      await notificationAPI.markAsRead({ notificationIds })

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true, readAt: new Date() })),
        unreadCount: 0,
      }))

      // Also emit via socket if connected
      if (socket) {
        notificationIds.forEach(id => {
          socket.emit('mark_notification_read', { notificationId: id })
        })
      }

      return true
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId)

      setState(prev => {
        const notification = prev.notifications.find(n => n._id === notificationId)
        const wasUnread = notification && !notification.isRead

        return {
          ...prev,
          notifications: prev.notifications.filter(n => n._id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        }
      })

      return true
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await notificationAPI.clearAllNotifications()

      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0,
      }))

      return true
    } catch (error) {
      console.error('Failed to clear notifications:', error)
      throw error
    }
  }

  // Send custom notification (admin only)
  const sendNotification = async (notificationData) => {
    try {
      const response = await notificationAPI.sendNotification(notificationData)

      // Show success toast
      toast.success('Notification sent successfully')

      return response.data
    } catch (error) {
      console.error('Failed to send notification:', error)
      toast.error('Failed to send notification')
      throw error
    }
  }

  // Get unread count
  const getUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      const unreadCount = response.data.count

      setState(prev => ({ ...prev, unreadCount }))

      return unreadCount
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return state.unreadCount
    }
  }

  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isConnected: state.isConnected,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotification,
    getUnreadCount,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext