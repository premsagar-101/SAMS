import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const Sidebar = ({ menuItems }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <Box sx={{ height: '100%', py: 1 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '15',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '25',
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" align="center">
          Version 1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center">
          © 2024 SAMS
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar