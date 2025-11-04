const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true,
    maxlength: [50, 'Room name cannot exceed 50 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        return v > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v) {
        return v.toDateString() === this.startTime.toDateString();
      },
      message: 'Date must match start time date'
    }
  },
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: [0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
    max: [6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)']
  },
  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    required: [true, 'Timetable is required']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required']
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
        validator: function(v) {
          return v.length === 2 &&
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  geofenceRadius: {
    type: Number,
    required: [true, 'Geofence radius is required'],
    min: [10, 'Geofence radius must be at least 10 meters'],
    max: [1000, 'Geofence radius cannot exceed 1000 meters'],
    default: 100
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
    required: true
  },
  qrGenerated: {
    type: Boolean,
    default: false
  },
  qrGeneratedAt: {
    type: Date,
    select: false
  },
  qrExpiresAt: {
    type: Date,
    select: false
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
periodSchema.index({ subject: 1 });
periodSchema.index({ teacher: 1 });
periodSchema.index({ timetable: 1 });
periodSchema.index({ semester: 1 });
periodSchema.index({ date: 1 });
periodSchema.index({ startTime: 1 });
periodSchema.index({ endTime: 1 });
periodSchema.index({ status: 1 });
periodSchema.index({ isActive: 1 });
periodSchema.index({ location: '2dsphere' });

// Compound indexes
periodSchema.index({ teacher: 1, date: 1, startTime: 1 });
periodSchema.index({ subject: 1, date: 1 });
periodSchema.index({ semester: 1, date: 1 });
periodSchema.index({ status: 1, startTime: 1 });

// Virtual fields
periodSchema.virtual('subjectInfo', {
  ref: 'Subject',
  localField: 'subject',
  foreignField: '_id',
  justOne: true
});

periodSchema.virtual('teacherInfo', {
  ref: 'User',
  localField: 'teacher',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email'
});

periodSchema.virtual('timetableInfo', {
  ref: 'Timetable',
  localField: 'timetable',
  foreignField: '_id',
  justOne: true
});

periodSchema.virtual('semesterInfo', {
  ref: 'Semester',
  localField: 'semester',
  foreignField: '_id',
  justOne: true
});

periodSchema.virtual('attendance', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'period',
  count: true
});

periodSchema.virtual('qrSession', {
  ref: 'QRSession',
  localField: '_id',
  foreignField: 'period',
  justOne: true
});

// Instance methods
periodSchema.methods.isCurrent = function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now;
};

periodSchema.methods.isPast = function() {
  return this.endTime < new Date();
};

periodSchema.methods.isFuture = function() {
  return this.startTime > new Date();
};

periodSchema.methods.getDurationMinutes = function() {
  return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
};

periodSchema.methods.canGenerateQR = function() {
  const now = new Date();
  const thirtyMinutesBefore = new Date(this.startTime.getTime() - 30 * 60 * 1000);
  const thirtyMinutesAfter = new Date(this.endTime.getTime() + 30 * 60 * 1000);

  return (
    now >= thirtyMinutesBefore &&
    now <= thirtyMinutesAfter &&
    this.status === 'scheduled' &&
    this.isActive
  );
};

periodSchema.methods.isWithinGracePeriod = function(graceMinutes) {
  const now = new Date();
  const graceEndTime = new Date(this.startTime.getTime() + graceMinutes * 60 * 1000);

  return now <= graceEndTime;
};

// Pre-save middleware
periodSchema.pre('save', async function(next) {
  // Validate timetable exists and is active
  if (this.isNew || this.isModified('timetable')) {
    const timetable = await mongoose.model('Timetable').findById(this.timetable);
    if (!timetable || !timetable.isActive) {
      const error = new Error('Timetable must exist and be active');
      return next(error);
    }

    // Copy location data from timetable if not provided
    if (this.isNew && (!this.location || !this.geofenceRadius)) {
      this.location = timetable.location;
      this.geofenceRadius = timetable.geofenceRadius;
    }
  }

  // Validate subject, teacher, and semester from timetable
  if (this.isNew) {
    const timetable = await mongoose.model('Timetable').findById(this.timetable);
    if (timetable) {
      if (!timetable.subject.equals(this.subject)) {
        const error = new Error('Subject must match timetable subject');
        return next(error);
      }
      if (!timetable.teacher.equals(this.teacher)) {
        const error = new Error('Teacher must match timetable teacher');
        return next(error);
      }
      if (!timetable.semester.equals(this.semester)) {
        const error = new Error('Semester must match timetable semester');
        return next(error);
      }
    }
  }

  // Auto-update status based on current time
  const now = new Date();
  if (this.isPast() && this.status === 'scheduled') {
    this.status = 'completed';
  } else if (this.isCurrent() && this.status === 'scheduled') {
    this.status = 'ongoing';
  }

  next();
});

// Pre-remove middleware
periodSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Archive related attendance records
  await mongoose.model('Attendance').updateMany(
    { period: this._id },
    {
      $set: {
        archived: true,
        archivedAt: new Date(),
        archiveReason: 'Period deleted'
      }
    }
  );

  // Delete associated QR session
  await mongoose.model('QRSession').deleteMany({ period: this._id });
});

// Static methods
periodSchema.statics.findByTeacher = function(
  teacherId,
  date,
  status
) {
  const query = { teacher: teacherId, isActive: true };

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('subject', 'name code')
    .populate('semester', 'name academicYear')
    .sort({ date: 1, startTime: 1 });
};

periodSchema.statics.findByDate = function(date, teacherId) {
  const query = {
    date: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lte: new Date(date.setHours(23, 59, 59, 999))
    },
    isActive: true
  };

  if (teacherId) {
    query.teacher = teacherId;
  }

  return this.find(query)
    .populate('teacher', 'firstName lastName email')
    .populate('subject', 'name code')
    .sort({ startTime: 1 });
};

periodSchema.statics.findCurrent = function(teacherId) {
  const now = new Date();
  const query = {
    startTime: { $lte: now },
    endTime: { $gte: now },
    status: { $in: ['scheduled', 'ongoing'] },
    isActive: true
  };

  if (teacherId) {
    query.teacher = teacherId;
  }

  return this.find(query)
    .populate('teacher', 'firstName lastName email')
    .populate('subject', 'name code')
    .populate('semester', 'name academicYear')
    .sort({ startTime: 1 });
};

periodSchema.statics.findUpcoming = function(
  teacherId,
  hours = 24
) {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

  const query = {
    startTime: { $gte: now, $lte: future },
    status: 'scheduled',
    isActive: true
  };

  if (teacherId) {
    query.teacher = teacherId;
  }

  return this.find(query)
    .populate('subject', 'name code')
    .sort({ startTime: 1 });
};

periodSchema.statics.findBySemester = function(semesterId) {
  return this.find({ semester: semesterId, isActive: true })
    .populate('teacher', 'firstName lastName email')
    .populate('subject', 'name code')
    .sort({ date: 1, startTime: 1 });
};

periodSchema.statics.generateDailySchedule = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
        isActive: true
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
        localField: 'teacher',
        foreignField: '_id',
        as: 'teacher'
      }
    },
    {
      $unwind: '$subject'
    },
    {
      $unwind: '$teacher'
    },
    {
      $group: {
        _id: '$teacher._id',
        teacher: { $first: '$teacher' },
        periods: {
          $push: {
            _id: '$_id',
            subject: '$subject',
            room: '$room',
            startTime: '$startTime',
            endTime: '$endTime',
            status: '$status'
          }
        }
      }
    },
    {
      $project: {
        teacherName: { $concat: ['$teacher.firstName', ' ', '$teacher.lastName'] },
        teacherEmail: '$teacher.email',
        periods: 1,
        periodCount: { $size: '$periods' }
      }
    },
    {
      $sort: { teacherName: 1 }
    }
  ]);
};

const Period = mongoose.model('Period', periodSchema);

module.exports = { Period };