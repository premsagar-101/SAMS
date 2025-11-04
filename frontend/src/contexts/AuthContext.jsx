import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null,
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const userStr = localStorage.getItem('user')

        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(userStr)

          // Validate token by making a request to get current user
          try {
            const response = await authAPI.getCurrentUser()
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.data,
                accessToken,
                refreshToken,
              },
            })
          } catch (error) {
            // Token is invalid, clear everything
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await authAPI.login(credentials)
      const { user, accessToken, refreshToken } = response.data

      // Store in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken },
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await authAPI.register(userData)
      const { user, accessToken, refreshToken } = response.data

      // Store in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken },
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to invalidate refresh token
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken({ refreshToken })
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

      // Update localStorage
      localStorage.setItem('accessToken', newAccessToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
        payload: { accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken },
      })

      return newAccessToken
    } catch (error) {
      // Refresh token failed, logout user
      logout()
      throw error
    }
  }

  // Update user profile
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))

    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    })
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const value = {
    // State
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext