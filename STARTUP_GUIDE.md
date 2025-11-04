# 🚀 SAMS Startup Guide

Complete guide to set up and run the Smart Attendance Management System.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **MongoDB** 6.0+ (running locally)
- **Git** (to clone the repository)

### Optional Software
- **Redis** (for session management and caching)
- **MongoDB Compass** (for database visualization)

---

## 🛠 Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/premsagar-101/SAMS.git
cd SAMS
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Start MongoDB
```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux (using systemctl)
sudo systemctl start mongod

# Or run MongoDB directly
mongod
```

### 4. (Optional) Start Redis
```bash
# On Windows (if installed as service)
net start redis

# On macOS (using Homebrew)
brew services start redis

# On Linux (using systemctl)
sudo systemctl start redis

# Or run Redis directly
redis-server
```

---

## 🗄 Database Setup

### 1. Seed the Database with Sample Data
```bash
cd backend
npm run db:seed
```

This will create:
- 3 departments (CSE, IT, ECE)
- 3 programs (B.Tech in each department)
- 1 admin user
- 1 HOD user
- 3 teachers
- 5 students
- 2 semesters
- 5 subjects
- 6 timetable entries
- Student enrollments

### 2. Generate Periods from Timetable
```bash
npm run db:generate-periods
```

This creates actual class periods for the next 7 days based on the timetable.

### 3. Quick Setup (Both Commands)
```bash
npm run db:setup
```

---

## 🚀 Running the Application

### Method 1: Run Both Servers Simultaneously

Open **two terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

### Method 2: Run with Docker Compose (Coming Soon)

---

## 🔗 Access the Application

### Frontend Application
- **URL**: http://localhost:5173
- **Development server with hot reload**

### Backend API
- **URL**: http://localhost:3001
- **API Base URL**: http://localhost:3001/api/v1

---

## 🔑 Login Credentials

### 👨‍💼 Administrator
- **Email**: `admin@sams.college`
- **Password**: `Admin@123`
- **Access**: Full system administration

### 👨‍🏫 Head of Department (HOD)
- **Email**: `hod.cse@sams.college`
- **Password**: `Hod@123`
- **Access**: Department management

### 👨‍🏫 Teachers
1. **Email**: `amit.sharma@sams.college`
   - **Password**: `Teacher@123`

2. **Email**: `priya.patel@sams.college`
   - **Password**: `Teacher@123`

3. **Email**: `john.smith@sams.college`
   - **Password**: `Teacher@123`

### 👨‍🎓 Students
1. **Email**: `rahul.cs2021@sams.college`
   - **Password**: `Student@123`

2. **Email**: `priya.cs2021@sams.college`
   - **Password**: `Student@123`

3. **Email**: `amit.cs2021@sams.college`
   - **Password**: `Student@123`

4. **Email**: `neha.cs2021@sams.college`
   - **Password**: `Student@123`

5. **Email**: `rohit.cs2021@sams.college`
   - **Password**: `Student@123`

---

## 🎯 Testing the System

### 1. Test QR Code Generation (Teacher Login)
1. Login as any teacher (e.g., `amit.sharma@sams.college`)
2. Go to "QR Generator" or "My Classes"
3. Generate a QR code for an upcoming period
4. Verify the QR code displays with countdown timer

### 2. Test QR Scanning (Student Login)
1. Login as any student (e.g., `rahul.cs2021@sams.college`)
2. Go to Dashboard or "Mark Attendance"
3. Use your mobile camera to scan the QR code
4. Grant location permissions when prompted
5. Verify attendance is marked successfully

### 3. Test Different User Roles
- **Admin**: View system statistics, manage users
- **HOD**: View department reports, manage subjects
- **Teacher**: Generate QR codes, view class attendance
- **Student**: View personal attendance, scan QR codes

---

## 🛠 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB if not running
mongod
```

#### 2. Port Already in Use
```bash
# Find process using port 3001
netstat -tulpn | grep :3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in backend/.env
PORT=3002
```

#### 3. Frontend Not Connecting to Backend
- Check if backend is running on port 3001
- Verify CORS configuration in backend
- Check API URL in frontend/.env

#### 4. Database Not Seeded
```bash
# Clear database and re-seed
cd backend
mongosh sams --eval "db.dropDatabase()"
npm run db:setup
```

#### 5. QR Code Scanning Issues
- Ensure HTTPS is used in production (camera permissions)
- Check browser console for errors
- Verify location services are enabled

### Log Files
- **Backend Logs**: Console output or `./logs/app.log`
- **Frontend Logs**: Browser developer console

---

## 📱 Mobile Testing

### Progressive Web App (PWA)
1. Open the application in Chrome mobile
2. Look for "Add to Home Screen" prompt
3. Install as PWA for app-like experience

### Camera Permissions
- **HTTPS Required**: Camera API requires HTTPS in production
- **Location Services**: Enable GPS for accurate attendance

---

## 🔧 Development Tips

### Hot Reload
- **Backend**: Automatically restarts on file changes
- **Frontend**: Automatically refreshes browser on changes

### Database Management
```bash
# Connect to database
mongosh sams

# View collections
show collections

# Query users
db.users.find().pretty()

# Reset attendance data
db.attendance.deleteMany({})
```

### API Testing
Use Postman, Insomnia, or curl to test endpoints:
```bash
# Test health check
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sams.college","password":"Admin@123"}'
```

---

## 🚀 Production Deployment

### Environment Variables
Copy `.env.example` to `.env` and update:
- Database URLs
- JWT secrets
- Email credentials
- OAuth keys

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend (no build needed for Node.js)
cd ../backend
npm start
```

---

## 📚 Additional Resources

- **API Documentation**: Check `/docs/api` in the backend
- **Database Schema**: Review `backend/src/models/`
- **Frontend Components**: Check `frontend/src/components/`

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all prerequisites are installed
4. Create an issue on the GitHub repository

---

**Happy Attendance Tracking! 🎉**