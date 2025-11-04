# Smart Attendance Management System (SAMS) - Backend API

A comprehensive attendance management system for colleges that combines QR code scanning with mandatory GPS location validation.

## Features

- **QR Code-Based Attendance**: Secure, encrypted QR codes with time-based expiry
- **GPS Location Validation**: Geofencing to ensure students are physically present
- **Role-Based Access Control**: Admin, HOD, Teacher, and Student roles
- **Real-Time Notifications**: In-app, email, and SMS notifications
- **Comprehensive Reporting**: Attendance analytics and compliance tracking
- **Semester Management**: Academic structure with automated period generation
- **Device Fingerprinting**: Prevents proxy attendance
- **OAuth Integration**: Google and Microsoft SSO support

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + OAuth (Google/Microsoft)
- **Security**: Helmet, CORS, Rate Limiting, bcrypt
- **QR Codes**: qrcode npm library with encryption
- **Location Services**: GPS validation with geofencing
- **Notifications**: Email (Nodemailer), SMS (Twilio), WebSocket

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd sams-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/sams
MONGODB_DB_NAME=sams

# Redis (optional)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# QR Code Configuration
QR_ENCRYPTION_KEY=your-super-secret-qr-encryption-key-32-bytes
QR_EXPIRY_MINUTES=3

# OAuth Configuration
OAUTH_GOOGLE_CLIENT_ID=your-google-oauth-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# AWS Configuration (for file storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=sams-assets
```

## API Documentation

### Base URL
- **Development**: http://localhost:3001/api/v1
- **Production**: https://api.sams.college.edu/api/v1

### Authentication Endpoints

#### POST /api/v1/auth/register
User registration with email verification

#### POST /api/v1/auth/login
User authentication with JWT tokens

#### GET /api/v1/auth/oauth/google
Initiate Google OAuth flow

#### POST /api/v1/auth/refresh
Refresh JWT access token

#### POST /api/v1/auth/logout
User logout and token invalidation

### Academic Management

#### GET /api/v1/academic/departments
List all departments

#### GET /api/v1/academic/programs
List academic programs

#### GET /api/v1/academic/semesters
List semesters

#### GET /api/v1/academic/subjects
List subjects

### Timetable Management

#### GET /api/v1/timetable
Get timetable for user/department

#### POST /api/v1/timetable
Create timetable entry (Admin/HOD)

#### GET /api/v1/periods/current
Get current periods for teacher

#### POST /api/v1/periods/generate
Generate daily periods from timetable

### QR Code & Attendance

#### POST /api/v1/qr/generate
Generate QR code for period (Teacher)

#### POST /api/v1/attendance/scan
Mark attendance by scanning QR (Student)

#### GET /api/v1/attendance
Get attendance records

#### GET /api/v1/attendance/my-attendance
Get student's own attendance

#### POST /api/v1/attendance/manual-override
Manual attendance override (Teacher/HOD)

### Reporting

#### GET /api/v1/reports/attendance-summary
Get attendance summary statistics

#### GET /api/v1/reports/export
Export attendance data (CSV/PDF/Excel)

#### GET /api/v1/reports/low-attendance
Get students with low attendance

### Notifications

#### GET /api/v1/notifications
Get user notifications

#### POST /api/v1/notifications/mark-read
Mark notifications as read

### System Configuration

#### GET /api/v1/config
Get system configuration (Admin)

#### PUT /api/v1/config
Update system configuration (Admin)

## Database Models

### Core Models

1. **User** - Authentication and user management
2. **Department** - Academic departments
3. **Program** - Academic programs
4. **Semester** - Academic semesters
5. **Subject** - Courses/subjects
6. **StudentEnrollment** - Student-subject relationships
7. **Timetable** - Weekly schedule template
8. **Period** - Daily class periods
9. **Attendance** - Individual attendance records
10. **QRSession** - QR code sessions
11. **Notification** - System notifications
12. **SystemConfig** - Configuration settings

### Key Features

- **Geospatial Indexing**: Location-based queries for GPS validation
- **TTL Indexes**: Automatic cleanup of expired data
- **Compound Indexes**: Optimized queries for complex lookups
- **Data Integrity**: Referential constraints and validation
- **Audit Trail**: Complete tracking of data changes

## Security Features

- **Password Security**: bcrypt hashing with configurable salt rounds
- **JWT Tokens**: RS256 asymmetric encryption with refresh tokens
- **Rate Limiting**: Configurable limits per endpoint and role
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet**: Security headers for Express.js

## Attendance Workflow

1. **QR Generation**: Teacher generates QR code for current period
2. **QR Scanning**: Student scans QR code with GPS location capture
3. **Location Validation**: System validates student location within geofence
4. **Attendance Recording**: Validated attendance is recorded with timestamp
5. **Real-time Updates**: Live attendance tracking for teachers
6. **Manual Override**: Teachers can manually adjust attendance if needed

## Development

### Running Tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Code Quality
```bash
npm run lint
npm run lint:fix
```

### Database Seeding
```bash
npm run db:seed
```

## Deployment

### Production Setup
1. Set production environment variables
2. Build and start the application
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL/TLS certificates
5. Configure monitoring and logging

### Docker Support
```bash
# Build image
docker build -t sams-backend .

# Run container
docker run -p 3001:3001 sams-backend
```

## Monitoring & Logging

- **Winston**: Structured logging with file rotation
- **Health Check**: `/health` endpoint for monitoring
- **Error Tracking**: Comprehensive error logging and alerts
- **Performance Monitoring**: Request/response time tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.