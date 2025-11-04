import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  period: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  scanTime: Date;
  markedAt: Date;
  status: 'present' | 'late' | 'absent';
  location: ILocation;
  locationAccuracy: number;
  deviceFingerprint: string;
  ipAddress: string;
  qrData: string;
  validationPassed: boolean;
  overrideReason?: string;
  overriddenBy?: mongoose.Types.ObjectId;
  overriddenAt?: Date;
  archived?: boolean;
  archivedAt?: Date;
  archiveReason?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getDurationInClass(): number;
  isValidLocation(classroomLocation: ILocation, radius: number): boolean;
}

const attendanceSchema = new Schema<IAttendance>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    validate: {
      validator: async function(v: mongoose.Types.ObjectId) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'student' && user.isActive;
      },
      message: 'Student must be an active user with student role'
    }
  },
  period: {
    type: Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, 'Period is required']
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required']
  },
  scanTime: {
    type: Date,
    required: [true, 'Scan time is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Scan time cannot be in the future'
    }
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    required: [true, 'Status is required'],
    default: 'present'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 &&
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  locationAccuracy: {
    type: Number,
    required: [true, 'Location accuracy is required'],
    min: [0, 'Location accuracy cannot be negative'],
    max: [1000, 'Location accuracy seems too high (>1000m)']
  },
  deviceFingerprint: {
    type: String,
    required: [true, 'Device fingerprint is required'],
    maxlength: [255, 'Device fingerprint cannot exceed 255 characters']
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    validate: {
      validator: function(v: string) {
        // IPv4 and IPv6 validation
        return /^(?:^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$)|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  qrData: {
    type: String,
    required: [true, 'QR data is required'],
    maxlength: [1000, 'QR data cannot exceed 1000 characters']
  },
  validationPassed: {
    type: Boolean,
    required: [true, 'Validation result is required'],
    default: true
  },
  overrideReason: {
    type: String,
    maxlength: [500, 'Override reason cannot exceed 500 characters']
  },
  overriddenBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(v: mongoose.Types.ObjectId) {
        if (!v) return true;
        const user = await mongoose.model('User').findById(v);
        return user && ['teacher', 'hod', 'admin'].includes(user.role) && user.isActive;
      },
      message: 'Override must be done by active teacher, HOD, or admin'
    }
  },
  overriddenAt: {
    type: Date
  },
  archived: {
    type: Boolean,
    default: false,
    select: false
  },
  archivedAt: {
    type: Date,
    select: false
  },
  archiveReason: {
    type: String,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
attendanceSchema.index({ student: 1, period: 1 }, { unique: true });
attendanceSchema.index({ period: 1, student: 1 });
attendanceSchema.index({ subject: 1, student: 1, semester: 1 });
attendanceSchema.index({ location: '2dsphere' });
attendanceSchema.index({ status: 1 });
attendanceSchema.index { scanTime: 1 });
attendanceSchema.index { markedAt: 1 };
attendanceSchema.index { semester: 1 };
attendanceSchema.index { subject: 1 });
attendanceSchema.index { deviceFingerprint: 1 });
attendanceSchema.index { ipAddress: 1 };

// Compound indexes for queries
attendanceSchema.index({ student: 1, semester: 1 });
attendanceSchema.index({ subject: 1, semester: 1 });
attendanceSchema.index({ status: 1, semester: 1 });
attendanceSchema.index({ scanTime: 1, status: 1 });

// Virtual fields
attendanceSchema.virtual('studentInfo', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email department'
});

attendanceSchema.virtual('periodInfo', {
  ref: 'Period',
  localField: 'period',
  foreignField: '_id',
  justOne: true
});

attendanceSchema.virtual('subjectInfo', {
  ref: 'Subject',
  localField: 'subject',
  foreignField: '_id',
  justOne: true
});

attendanceSchema.virtual('semesterInfo', {
  ref: 'Semester',
  localField: 'semester',
  foreignField: '_id',
  justOne: true
});

attendanceSchema.virtual('overrideUserInfo', {
  ref: 'User',
  localField: 'overriddenBy',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email role'
});

// Instance methods
attendanceSchema.methods.getDurationInClass = function(): number {
  if (!this.scanTime) return 0;
  return Date.now() - this.scanTime.getTime();
};

attendanceSchema.methods.isValidLocation = function(
  classroomLocation: ILocation,
  radius: number
): boolean {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.location.coordinates[1] * Math.PI / 180;
  const φ2 = classroomLocation.coordinates[1] * Math.PI / 180;
  const Δφ = (classroomLocation.coordinates[1] - this.location.coordinates[1]) * Math.PI / 180;
  const Δλ = (classroomLocation.coordinates[0] - this.location.coordinates[0]) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance <= radius;
};

// Pre-save middleware
attendanceSchema.pre('save', async function(next) {
  // Validate period exists and is active
  if (this.isNew || this.isModified('period')) {
    const period = await mongoose.model('Period').findById(this.period);
    if (!period || !period.isActive) {
      const error = new Error('Period must exist and be active');
      return next(error);
    }

    // Ensure subject, semester match period
    if (!period.subject.equals(this.subject)) {
      const error = new Error('Subject must match period subject');
      return next(error);
    }
    if (!period.semester.equals(this.semester)) {
      const error = new Error('Semester must match period semester');
      return next(error);
    }

    // Validate scan time is within period window (+/- grace period)
    const graceMinutes = parseInt(process.env.LATE_GRACE_MINUTES || '15');
    const earlyGraceMinutes = parseInt(process.env.EARLY_GRACE_MINUTES || '10');
    const allowedStart = new Date(period.startTime.getTime() - earlyGraceMinutes * 60 * 1000);
    const allowedEnd = new Date(period.endTime.getTime() + graceMinutes * 60 * 1000);

    if (this.scanTime < allowedStart || this.scanTime > allowedEnd) {
      const error = new Error('Scan time is outside the allowed period window');
      return next(error);
    }

    // Auto-determine status based on scan time
    if (this.scanTime > period.startTime) {
      const lateThreshold = new Date(period.startTime.getTime() + graceMinutes * 60 * 1000);
      this.status = this.scanTime <= lateThreshold ? 'late' : 'absent';
    }
  }

  // Validate student is enrolled in the subject
  if (this.isNew || this.isModified('student') || this.isModified('subject') || this.isModified('semester')) {
    const enrollment = await mongoose.model('StudentEnrollment').findOne({
      student: this.student,
      subject: this.subject,
      semester: this.semester,
      isActive: true
    });

    if (!enrollment) {
      const error = new Error('Student is not enrolled in this subject for the semester');
      return next(error);
    }
  }

  // Check for duplicate attendance
  if (this.isNew && !this.overriddenBy) {
    const existing = await mongoose.model('Attendance').findOne({
      student: this.student,
      period: this.period
    });

    if (existing) {
      const error = new Error('Attendance already marked for this period');
      return next(error);
    }
  }

  // Set override timestamp if overridden
  if (this.isModified('overriddenBy') && this.overriddenBy && !this.overriddenAt) {
    this.overriddenAt = new Date();
  }

  next();
});

// Pre-remove middleware
attendanceSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Log deletion for audit
  await mongoose.model('AuditLog').create({
    action: 'DELETE',
    entityType: 'Attendance',
    entityId: this._id,
    userId: this.overriddenBy,
    reason: this.archiveReason || 'Attendance record deleted',
    timestamp: new Date(),
    details: {
      student: this.student,
      period: this.period,
      subject: this.subject,
      status: this.status
    }
  });
});

// Static methods
attendanceSchema.statics.findByStudent = function(
  studentId: mongoose.Types.ObjectId,
  semesterId?: mongoose.Types.ObjectId,
  subjectId?: mongoose.Types.ObjectId
) {
  const query: any = { student: studentId };

  if (semesterId) {
    query.semester = semesterId;
  }

  if (subjectId) {
    query.subject = subjectId;
  }

  return this.find(query)
    .populate('period', 'date startTime endTime room')
    .populate('subject', 'name code')
    .sort({ scanTime: -1 });
};

attendanceSchema.statics.findByPeriod = function(periodId: mongoose.Types.ObjectId) {
  return this.find({ period: periodId })
    .populate('student', 'firstName lastName email')
    .sort({ scanTime: 1 });
};

attendanceSchema.statics.findBySubject = function(
  subjectId: mongoose.Types.ObjectId,
  semesterId?: mongoose.Types.ObjectId
) {
  const query: any = { subject: subjectId };

  if (semesterId) {
    query.semester = semesterId;
  }

  return this.find(query)
    .populate('student', 'firstName lastName email')
    .populate('period', 'date startTime endTime room')
    .sort({ scanTime: -1 });
};

attendanceSchema.statics.getAttendanceStats = function(
  subjectId?: mongoose.Types.ObjectId,
  semesterId?: mongoose.Types.ObjectId,
  studentId?: mongoose.Types.ObjectId
) {
  const matchQuery: any = {};

  if (subjectId) matchQuery.subject = subjectId;
  if (semesterId) matchQuery.semester = semesterId;
  if (studentId) matchQuery.student = studentId;

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          student: '$student',
          subject: '$subject',
          status: '$status'
        },
        count: { $sum: 1 },
        lastScan: { $max: '$scanTime' }
      }
    },
    {
      $group: {
        _id: {
          student: '$_id.student',
          subject: '$_id.subject'
        },
        stats: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        totalPeriods: { $sum: '$count' },
        lastScan: { $first: '$lastScan' }
      }
    },
    {
      $addFields: {
        presentCount: {
          $let: {
            vars: { presentStat: { $arrayElemAt: [{ $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'present'] } } }, 0] } },
            in: { $ifNull: ['$$presentStat.count', 0] }
          }
        },
        lateCount: {
          $let: {
            vars: { lateStat: { $arrayElemAt: [{ $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'late'] } } }, 0] } },
            in: { $ifNull: ['$$lateStat.count', 0] }
          }
        },
        absentCount: {
          $let: {
            vars: { absentStat: { $arrayElemAt: [{ $filter: { input: '$stats', cond: { $eq: ['$$this.status', 'absent'] } } }, 0] } },
            in: { $ifNull: ['$$absentStat.count', 0] }
          }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $multiply: [
            {
              $divide: [
                { $add: ['$presentCount', '$lateCount'] },
                '$totalPeriods'
              ]
            },
            100
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.student',
        foreignField: '_id',
        as: 'studentInfo'
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id.subject',
        foreignField: '_id',
        as: 'subjectInfo'
      }
    },
    {
      $unwind: '$studentInfo'
    },
    {
      $unwind: '$subjectInfo'
    }
  ]);
};

attendanceSchema.statics.getDailyAttendanceReport = function(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        scanTime: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $lookup: {
        from: 'periods',
        localField: 'period',
        foreignField: '_id',
        as: 'period'
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subject',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'student',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$period'
    },
    {
      $unwind: '$subject'
    },
    {
      $unwind: '$student'
    },
    {
      $group: {
        _id: {
          subject: '$subject.name',
          period: '$period.startTime',
          teacher: '$period.teacher'
        },
        totalStudents: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        attendancePercentage: {
          $avg: { $cond: [{ $in: ['$status', ['present', 'late']] }, 100, 0 ] }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.teacher',
        foreignField: '_id',
        as: 'teacherInfo'
      }
    },
    {
      $unwind: '$teacherInfo'
    },
    {
      $project: {
        subjectName: '$_id.subject',
        periodTime: '$_id.period',
        teacherName: { $concat: ['$teacherInfo.firstName', ' ', '$teacherInfo.lastName'] },
        totalStudents: 1,
        present: 1,
        late: 1,
        absent: 1,
        attendancePercentage: { $round: ['$attendancePercentage', 2] }
      }
    },
    {
      $sort: { periodTime: 1, subjectName: 1 }
    }
  ]);
};

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);