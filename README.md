# Smart Attendance Management System (SAMS)

A comprehensive attendance tracking solution for educational institutions that combines QR code scanning with mandatory GPS location validation to ensure accurate and secure attendance tracking.

## 🚀 Features

### Core Features
- **QR Code-based Attendance**: Teachers generate time-bound QR codes for each class period
- **GPS Location Validation**: Students must be within the designated geofence to mark attendance
- **Real-time Attendance Tracking**: Live monitoring of attendance as students scan QR codes
- **Multi-role Support**: Student, Teacher, HOD, and Admin dashboards
- **Automated Reports**: Comprehensive attendance analytics and export functionality
- **Mobile-first Design**: Responsive web interface with PWA capabilities

### Advanced Features
- **Device Fingerprinting**: Prevents proxy attendance through device validation
- **Manual Override**: Teachers can manually mark attendance with audit trails
- **Low Attendance Alerts**: Automatic notifications for students below threshold
- **Semester Management**: Academic calendar and period scheduling
- **Department Analytics**: Role-based access to attendance statistics
- **Export Capabilities**: CSV, PDF, and Excel report generation

## 🛠 Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Material-UI (MUI)** for modern UI components
- **React Query** for server state management
- **React Router** for navigation
- **Axios** for API communication
- **QR Scanner** integration for mobile devices

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **bcrypt** for password hashing
- **Redis** for session management
- **Socket.io** for real-time updates

### Security Features
- AES-256-GCM encryption for QR data
- OAuth integration (Google, Microsoft)
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS and security headers
- Device fingerprinting for anti-proxy

## 📋 Project Structure

```
SAMS/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── models/        # MongoDB data models
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Authentication & validation
│   │   ├── utils/         # Helper functions
│   │   └── config/        # Database & app configuration
│   └── package.json
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── contexts/      # React contexts
│   │   └── theme/         # Material-UI theme
│   └── package.json
└── shared/                # Shared types and utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+
- Redis (optional, for session storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SAMS
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/sams
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   QR_ENCRYPTION_KEY=your-32-character-encryption-key
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3001/api/v1
   VITE_APP_NAME=SAMS
   ```

5. **Start the development servers**

   Terminal 1 - Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📊 Database Schema

### Key Models
- **User**: Authentication and user management
- **Attendance**: Individual attendance records with GPS data
- **QRSession**: Time-bound QR code sessions
- **Period**: Scheduled class periods
- **Timetable**: Weekly schedule templates
- **Department**: Organizational structure
- **Subject**: Academic subjects and courses

### Security Features
- Geospatial indexing for location queries
- Encrypted QR data with time-based expiry
- Audit trails for all manual overrides
- Device fingerprinting for anti-proxy measures

## 🔐 Authentication & Authorization

### User Roles
- **Student**: Scan QR codes, view personal attendance
- **Teacher**: Generate QR codes, manage class attendance
- **HOD**: Department-level monitoring and reports
- **Admin**: Full system access and configuration

### OAuth Integration
- Google Workspace for Education
- Microsoft Education accounts
- College email domain verification

## 📱 Mobile Support

The web application is mobile-responsive and includes:
- PWA capabilities for offline functionality
- Camera integration for QR scanning
- GPS location services
- Push notifications (supported browsers)

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

## 📈 Reporting & Analytics

### Available Reports
- Personal attendance summaries
- Class-wide attendance statistics
- Department-level analytics
- Low attendance alerts
- Export functionality (CSV, PDF, Excel)

### Real-time Features
- Live attendance tracking
- QR code session monitoring
- Notification system
- Dashboard updates

## 🔧 Configuration

### System Settings
- QR code expiry time (default: 3 minutes)
- Geofence radius (default: 100 meters)
- Minimum attendance threshold (default: 75%)
- Notification preferences
- Academic calendar settings

### Environment Variables
See the `.env.example` files in both `backend` and `frontend` directories for all available configuration options.

## 🚀 Deployment

### Production Deployment
1. Build the frontend: `npm run build`
2. Configure production environment variables
3. Deploy to your preferred hosting platform
4. Set up MongoDB and Redis clusters
5. Configure SSL certificates
6. Set up monitoring and logging

### Docker Support
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh

### Attendance Endpoints
- `POST /api/v1/attendance/scan` - Mark attendance via QR
- `GET /api/v1/attendance/my-attendance` - Get personal attendance
- `POST /api/v1/attendance/manual-override` - Manual attendance override

### QR Code Endpoints
- `POST /api/v1/qr/generate` - Generate QR code
- `GET /api/v1/qr/session/:id` - Get QR session details

### Reports Endpoints
- `GET /api/v1/reports/attendance-summary` - Attendance summary
- `GET /api/v1/reports/export` - Export reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [FAQ](docs/faq.md)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Biometric authentication
- [ ] AI-powered attendance predictions
- [ ] Integration with learning management systems
- [ ] Offline attendance sync
- [ ] Multi-language support

### Version History
- **v2.0.0** - Current version with full QR + GPS functionality
- **v1.0.0** - Initial release with basic attendance tracking

---

Built with ❤️ for educational institutions to streamline attendance management and enhance academic integrity.