const mongoose = require('mongoose');

const studentEnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'student' && user.isActive;
      },
      message: 'Student must be an active user with student role'
    }
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentEnrollmentSchema.index({ student: 1, subject: 1 }, { unique: true });
studentEnrollmentSchema.index({ student: 1, semester: 1 });
studentEnrollmentSchema.index({ subject: 1 });
studentEnrollmentSchema.index({ semester: 1 });
studentEnrollmentSchema.index({ isActive: 1 });

// Compound index for uniqueness
studentEnrollmentSchema.index(
  { student: 1, subject: 1, semester: 1 },
  { unique: true }
);

// Virtual fields
studentEnrollmentSchema.virtual('attendanceStats', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'enrollment',
  count: true
});

studentEnrollmentSchema.virtual('studentInfo', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email'
});

studentEnrollmentSchema.virtual('subjectInfo', {
  ref: 'Subject',
  localField: 'subject',
  foreignField: '_id',
  justOne: true
});

studentEnrollmentSchema.virtual('semesterInfo', {
  ref: 'Semester',
  localField: 'semester',
  foreignField: '_id',
  justOne: true
});

// Instance methods
studentEnrollmentSchema.methods.getAttendanceStats = async function() {
  const Attendance = mongoose.model('Attendance');

  const stats = await Attendance.aggregate([
    {
      $match: {
        student: this.student,
        subject: this.subject,
        semester: this.semester
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    percentage: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  if (result.total > 0) {
    result.percentage = ((result.present + result.late) / result.total) * 100;
  }

  return result;
};

// Pre-save middleware
studentEnrollmentSchema.pre('save', async function(next) {
  // Validate subject exists and is active
  if (this.isNew || this.isModified('subject')) {
    const subject = await mongoose.model('Subject').findById(this.subject);
    if (!subject || !subject.isActive) {
      const error = new Error('Subject must exist and be active');
      return next(error);
    }
  }

  // Validate semester exists and is active
  if (this.isNew || this.isModified('semester')) {
    const semester = await mongoose.model('Semester').findById(this.semester);
    if (!semester || !semester.isActive) {
      const error = new Error('Semester must exist and be active');
      return next(error);
    }

    // Ensure subject belongs to the same semester
    const subject = await mongoose.model('Subject').findById(this.subject);
    if (!subject.semester.equals(this.semester)) {
      const error = new Error('Subject must belong to the specified semester');
      return next(error);
    }
  }

  // Check for existing enrollment
  if (this.isNew) {
    const existing = await mongoose.model('StudentEnrollment').findOne({
      student: this.student,
      subject: this.subject,
      semester: this.semester
    });

    if (existing) {
      const error = new Error('Student is already enrolled in this subject for the semester');
      return next(error);
    }
  }

  next();
});

// Pre-remove middleware
studentEnrollmentSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Archive related attendance records
  await mongoose.model('Attendance').updateMany(
    { student: this.student, subject: this.subject, semester: this.semester },
    {
      $set: {
        archived: true,
        archivedAt: new Date(),
        archiveReason: 'Enrollment deleted'
      }
    }
  );
});

// Static methods
studentEnrollmentSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId, isActive: true })
    .populate('subject', 'name code credits')
    .populate('semester', 'name academicYear')
    .sort({ semester: -1, subject: 1 });
};

studentEnrollmentSchema.statics.findBySubject = function(subjectId) {
  return this.find({ subject: subjectId, isActive: true })
    .populate('student', 'firstName lastName email')
    .populate('semester', 'name academicYear')
    .sort({ student: 1 });
};

studentEnrollmentSchema.statics.findBySemester = function(semesterId) {
  return this.find({ semester: semesterId, isActive: true })
    .populate('student', 'firstName lastName email department')
    .populate('subject', 'name code credits')
    .sort({ subject: 1, student: 1 });
};

studentEnrollmentSchema.statics.findEnrollment = function(
  studentId,
  subjectId,
  semesterId
) {
  return this.findOne({
    student: studentId,
    subject: subjectId,
    semester: semesterId,
    isActive: true
  });
};

studentEnrollmentSchema.statics.getStudentCountBySubject = function(subjectId) {
  return this.countDocuments({ subject: subjectId, isActive: true });
};

studentEnrollmentSchema.statics.getStudentCountBySemester = function(semesterId) {
  return this.aggregate([
    { $match: { semester: semesterId, isActive: true } },
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subject'
      }},
    { $unwind: '$subject' },
    { $project: {
        subjectName: '$subject.name',
        subjectCode: '$subject.code',
        studentCount: '$count'
      }}
  ]);
};

const StudentEnrollment = mongoose.model('StudentEnrollment', studentEnrollmentSchema);

module.exports = { StudentEnrollment };