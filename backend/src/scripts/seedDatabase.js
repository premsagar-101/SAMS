const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Department = require('../models/Department');
const Program = require('../models/Program');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const StudentEnrollment = require('../models/StudentEnrollment');

const sampleData = {
  departments: [
    {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering'
    },
    {
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology'
    },
    {
      name: 'Electronics and Communication',
      code: 'ECE',
      description: 'Department of Electronics and Communication Engineering'
    }
  ],

  programs: [
    {
      name: 'B.Tech Computer Science and Engineering',
      code: 'BTCS',
      duration: 4,
      totalSemesters: 8
    },
    {
      name: 'B.Tech Information Technology',
      code: 'BTIT',
      duration: 4,
      totalSemesters: 8
    },
    {
      name: 'B.Tech Electronics and Communication',
      code: 'BTEC',
      duration: 4,
      totalSemesters: 8
    }
  ],

  users: {
    admin: {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@sams.college',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    },
    hod: {
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      email: 'hod.cse@sams.college',
      password: 'Hod@123',
      role: 'hod',
      isActive: true,
      isEmailVerified: true
    },
    teachers: [
      {
        firstName: 'Prof. Amit',
        lastName: 'Sharma',
        email: 'amit.sharma@sams.college',
        password: 'Teacher@123',
        role: 'teacher',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Dr. Priya',
        lastName: 'Patel',
        email: 'priya.patel@sams.college',
        password: 'Teacher@123',
        role: 'teacher',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Prof. John',
        lastName: 'Smith',
        email: 'john.smith@sams.college',
        password: 'Teacher@123',
        role: 'teacher',
        isActive: true,
        isEmailVerified: true
      }
    ],
    students: [
      {
        firstName: 'Rahul',
        lastName: 'Kumar',
        email: 'rahul.cs2021@sams.college',
        password: 'Student@123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Priya',
        lastName: 'Gupta',
        email: 'priya.cs2021@sams.college',
        password: 'Student@123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Amit',
        lastName: 'Singh',
        email: 'amit.cs2021@sams.college',
        password: 'Student@123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Neha',
        lastName: 'Verma',
        email: 'neha.cs2021@sams.college',
        password: 'Student@123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Rohit',
        lastName: 'Sharma',
        email: 'rohit.cs2021@sams.college',
        password: 'Student@123',
        role: 'student',
        isActive: true,
        isEmailVerified: true
      }
    ]
  },

  semesters: [
    {
      name: 'Semester 1',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-11-30'),
      academicYear: '2024-25',
      isActive: true,
      isCurrent: true
    },
    {
      name: 'Semester 2',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2025-04-30'),
      academicYear: '2024-25',
      isActive: false,
      isCurrent: false
    }
  ],

  subjects: [
    {
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      credits: 4,
      description: 'Study of data structures and algorithmic techniques'
    },
    {
      name: 'Database Management Systems',
      code: 'CS202',
      credits: 4,
      description: 'Database design and SQL programming'
    },
    {
      name: 'Web Development',
      code: 'CS203',
      credits: 3,
      description: 'Modern web development technologies'
    },
    {
      name: 'Operating Systems',
      code: 'CS204',
      credits: 4,
      description: 'Operating system concepts and principles'
    },
    {
      name: 'Computer Networks',
      code: 'CS205',
      credits: 4,
      description: 'Computer network fundamentals and protocols'
    }
  ],

  timetable: [
    {
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '10:30',
      room: 'CS-301',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Example coordinates
      },
      geofenceRadius: 100
    },
    {
      dayOfWeek: 1, // Monday
      startTime: '11:00',
      endTime: '12:30',
      room: 'CS-302',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      geofenceRadius: 100
    },
    {
      dayOfWeek: 2, // Tuesday
      startTime: '09:00',
      endTime: '10:30',
      room: 'CS-301',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      geofenceRadius: 100
    },
    {
      dayOfWeek: 3, // Wednesday
      startTime: '11:00',
      endTime: '12:30',
      room: 'CS-303',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      geofenceRadius: 100
    },
    {
      dayOfWeek: 4, // Thursday
      startTime: '09:00',
      endTime: '10:30',
      room: 'CS-302',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      geofenceRadius: 100
    },
    {
      dayOfWeek: 5, // Friday
      startTime: '11:00',
      endTime: '12:30',
      room: 'CS-301',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      geofenceRadius: 100
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sams');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Program.deleteMany({});
    await Semester.deleteMany({});
    await Subject.deleteMany({});
    await Timetable.deleteMany({});
    await StudentEnrollment.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create departments
    console.log('📚 Creating departments...');
    const createdDepartments = await Department.insertMany(sampleData.departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);

    // Create programs
    console.log('🎓 Creating programs...');
    const programsWithDepartment = sampleData.programs.map((program, index) => ({
      ...program,
      department: createdDepartments[index % createdDepartments.length]._id
    }));
    const createdPrograms = await Program.insertMany(programsWithDepartment);
    console.log(`✅ Created ${createdPrograms.length} programs`);

    // Create users
    console.log('👥 Creating users...');

    // Hash passwords
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 12);
    };

    // Create admin user
    const adminUser = new User({
      ...sampleData.users.admin,
      password: await hashPassword(sampleData.users.admin.password)
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // Create HOD user
    const hodUser = new User({
      ...sampleData.users.hod,
      password: await hashPassword(sampleData.users.hod.password),
      department: createdDepartments[0]._id // CSE department
    });
    await hodUser.save();
    console.log('✅ Created HOD user');

    // Create teachers
    const createdTeachers = [];
    for (const teacher of sampleData.users.teachers) {
      const teacherUser = new User({
        ...teacher,
        password: await hashPassword(teacher.password),
        department: createdDepartments[0]._id // CSE department
      });
      createdTeachers.push(await teacherUser.save());
    }
    console.log(`✅ Created ${createdTeachers.length} teachers`);

    // Create students
    const createdStudents = [];
    for (const student of sampleData.users.students) {
      const studentUser = new User({
        ...student,
        password: await hashPassword(student.password),
        department: createdDepartments[0]._id // CSE department
      });
      createdStudents.push(await studentUser.save());
    }
    console.log(`✅ Created ${createdStudents.length} students`);

    // Create semesters
    console.log('📅 Creating semesters...');
    const semestersWithProgram = sampleData.semesters.map(semester => ({
      ...semester,
      program: createdPrograms[0]._id // B.Tech CSE program
    }));
    const createdSemesters = await Semester.insertMany(semestersWithProgram);
    console.log(`✅ Created ${createdSemesters.length} semesters`);

    // Create subjects
    console.log('📖 Creating subjects...');
    const subjectsWithDetails = sampleData.subjects.map((subject, index) => ({
      ...subject,
      department: createdDepartments[0]._id, // CSE department
      semester: createdSemesters[0]._id, // Current semester
      program: createdPrograms[0]._id // B.Tech CSE program
    }));
    const createdSubjects = await Subject.insertMany(subjectsWithDetails);
    console.log(`✅ Created ${createdSubjects.length} subjects`);

    // Create timetable entries
    console.log('📋 Creating timetable entries...');
    const timetableEntries = sampleData.timetable.map((entry, index) => ({
      ...entry,
      subject: createdSubjects[index % createdSubjects.length]._id,
      teacher: createdTeachers[index % createdTeachers.length]._id,
      semester: createdSemesters[0]._id,
      program: createdPrograms[0]._id,
      department: createdDepartments[0]._id
    }));
    const createdTimetable = await Timetable.insertMany(timetableEntries);
    console.log(`✅ Created ${createdTimetable.length} timetable entries`);

    // Create student enrollments
    console.log('📝 Creating student enrollments...');
    const enrollments = [];
    for (const student of createdStudents) {
      for (const subject of createdSubjects) {
        enrollments.push({
          student: student._id,
          subject: subject._id,
          semester: createdSemesters[0]._id
        });
      }
    }
    await StudentEnrollment.insertMany(enrollments);
    console.log(`✅ Created ${enrollments.length} student enrollments`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdDepartments.length} departments`);
    console.log(`   - ${createdPrograms.length} programs`);
    console.log(`   - ${createdStudents.length + createdTeachers.length + 2} users (1 admin, 1 HOD, ${createdTeachers.length} teachers, ${createdStudents.length} students)`);
    console.log(`   - ${createdSemesters.length} semesters`);
    console.log(`   - ${createdSubjects.length} subjects`);
    console.log(`   - ${createdTimetable.length} timetable entries`);
    console.log(`   - ${enrollments.length} student enrollments`);

    console.log('\n🔑 Login Credentials:');
    console.log('\n👨‍💼 Admin:');
    console.log('   Email: admin@sams.college');
    console.log('   Password: Admin@123');

    console.log('\n👨‍🏫 HOD:');
    console.log('   Email: hod.cse@sams.college');
    console.log('   Password: Hod@123');

    console.log('\n👨‍🏫 Teachers:');
    sampleData.users.teachers.forEach((teacher, index) => {
      console.log(`   ${index + 1}. Email: ${teacher.email}`);
      console.log(`      Password: Teacher@123`);
    });

    console.log('\n👨‍🎓 Students:');
    sampleData.users.students.forEach((student, index) => {
      console.log(`   ${index + 1}. Email: ${student.email}`);
      console.log(`      Password: Student@123`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;