# SAMS Frontend Application

Smart Attendance Management System (SAMS) - Frontend Application built with React and Vite.

## Features

### Core Functionality
- **QR Code Scanning**: Real-time QR code scanning for student attendance
- **GPS Location Validation**: Geofencing to ensure physical presence
- **Role-Based Dashboards**: Tailored interfaces for Students, Teachers, HODs, and Admins
- **Real-Time Notifications**: Live updates for attendance and system alerts
- **Responsive Design**: Mobile-first design for all device sizes
- **Attendance History**: Comprehensive attendance tracking and analytics
- **Profile Management**: User profile and settings management

### Authentication
- Email/Password login
- OAuth integration (Google, Microsoft)
- Session management with refresh tokens
- Role-based access control
- Password reset functionality
- Multi-factor authentication ready

### Student Features
- **QR Scanner**: Mobile-friendly QR code scanner with camera access
- **Location Services**: GPS location capture and validation
- **Attendance History**: View personal attendance records and statistics
- **Notifications**: Real-time attendance confirmations and alerts
- **Profile Management**: Personal information and settings

### Teacher Features
- **QR Generator**: Generate secure, time-bound QR codes for classes
- **Real-time Tracking**: Live attendance monitoring during classes
- **Manual Override**: Override attendance when necessary
- **Class Management**: View and manage student enrollment
- **Timetable Integration**: View class schedules
- **Attendance Reports**: Class and subject-wise attendance analytics

### HOD Features
- **Department Overview**: Department-wide attendance statistics
- **Teacher Monitoring**: Track teacher performance and compliance
- **Student Analytics**: At-risk student identification
- **Department Reports**: Comprehensive departmental analytics
- **Academic Oversight**: Semester-wise compliance tracking

### Admin Features
- **User Management**: Create and manage user accounts
- **Academic Structure**: Manage departments, programs, subjects, semesters
- **Timetable Management**: Create and manage class schedules
- **System Configuration**: Configure system settings and policies
- **Reports & Analytics**: Global statistics and compliance reports
- **System Monitoring**: Health checks and performance metrics

## Technology Stack

### Frontend
- **Framework**: React 18 with functional components
- **Build Tool**: Vite for fast development
- **Routing**: React Router for navigation
- **State Management**: React Query for server state
- **UI Components**: Material-UI (MUI) for consistent design
- **QR Code**: qrcode.js for QR code generation
- **Camera**: react-webcam for camera access
- **Location**: HTML5 Geolocation API

### Development Tools
- **Bundler**: Vite for fast HMR
- **Linting**: ESLint for code quality
- **Prettier**: Code formatting
- **Testing**: Jest for unit testing
- **Hot Module Replacement**: Fast refresh during development

### Styling & UI
- **Theme**: Material Design components
- **Responsive**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 compliance
- **Animations**: Smooth transitions and micro-interactions
- **Typography**: Roboto font family
- **Colors**: Consistent color palette throughout

## Installation

```bash
# Navigate to frontend directory
cd SAMS/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

### Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_NODE_ENV=development

# Features (uncomment to enable)
VITE_PWA=true
VITE_USE_DEV_CERTS=true
```

## Usage

### Development
```bash
npm run dev
```

This starts the Vite development server on port 3000 with hot module replacement.

### Production Build
```bash
npm run build
```

Creates an optimized production build in the `dist` folder ready for deployment.

### Preview
```bash
npm run preview
```
Serves the production build locally for testing.

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Auth/       # Authentication components
│   ├── Layout/      # Layout components
│   └── Common/      # Common UI elements
├── pages/          # Page components
│   ├── auth/       # Authentication pages
│   ├── dashboard/   # Role-based dashboards
│   ├── attendance/ # Attendance features
│   ├── academic/    # Academic management
│   ├── reports/     # Reports and analytics
│   ├── profile/     # User profile and settings
│   └── notifications/ # Notification system
├── services/       # API service layer
│   ├── api.js       # API client configuration
│   └── hooks/       # Custom React hooks
├── contexts/       # React contexts
│   ├── AuthContext.js
│   └── NotificationContext.js
├── utils/          # Utility functions
├── assets/         # Static assets
├── App.jsx         # Main App component
├�── main.jsx        # Application entry point
└── theme/          # Theme configuration
└── index.html       # HTML template
└── .env.example    # Environment variables
```

## Key Features Implementation

### QR Code System
- **Secure Encryption**: QR codes contain encrypted session data
- **Time-Based Expiry**: QR codes automatically expire after set time
- **Location Validation**: GPS coordinates must be within geofence
- **Session Management**: Track QR session lifecycle
- **Duplicate Prevention**: One scan per student per period

### Location Validation
- **GPS Access**: Request location permissions from browser
- **Accuracy Check**: Validate GPS accuracy threshold
- **Geofencing**: Calculate distance from classroom location
- **Privacy**: Location data encrypted and protected

### Real-Time Features
- **WebSocket Integration**: Live updates for attendance
- **Live Notifications**: Real-time alerts and confirmations
- **Live Dashboard**: Real-time statistics and tracking
- **Auto-Refresh**: Keep data current automatically

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role Permissions**: Role-based access control
- **Input Validation**: Client and server-side validation
- **HTTPS Ready**: Secure communication
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Cross-site request protection

## API Integration

The frontend integrates with the SAMS backend API through a well-structured service layer:

- **Authentication**: Login, logout, profile management
- **Attendance**: QR scanning, attendance records, manual overrides
- **Academic**: Departments, programs, subjects, semesters
- **Reports**: Attendance analytics and data export
- **Notifications**: Real-time notification system
- **System**: Configuration and health checks

## Progressive Web App (PWA)

The application is configured for PWA capabilities:

- **Service Worker**: Background sync capabilities
- **Manifest**: Complete app manifest
- **Offline Support**: Basic offline functionality
- **Install Prompt**: Add to home screen capability

## Performance Optimizations

- **Code Splitting**: Automatic code splitting for faster loads
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized image loading
- **Bundle Analysis**: Bundle size optimization
- **Caching**: Appropriate caching strategies

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **Mobile Browsers**: Chrome Mobile, Safari Mobile Safari
- **Edge**: Microsoft Edge
- **Progressive Enhancement**: Works in older browsers with basic functionality

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- **Component-Based**: Build modular, reusable components
- **Consistent Styling**: Follow Material Design guidelines
- **TypeScript**: Use TypeScript for type safety
- **Documentation**: Document complex components
- **Testing**: Include appropriate test coverage

### Git Workflow
- **Branch Strategy**: Feature branches, main for releases
- **Commit Messages**: Clear, descriptive commit messages
- **Code Reviews**: Peer review required for all changes
- **CI/CD**: Automated testing and deployment

## License

This project is licensed under the MIT License.

## Support

For support, questions, or contributions, please create an issue in the repository.

---

Built with ❤️ for educational institutions to streamline attendance management.