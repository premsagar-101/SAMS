import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ITimetable extends Document {
  _id: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  room: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  semester: mongoose.Types.ObjectId;
  location: ILocation;
  geofenceRadius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getTimeRange(): { start: Date; end: Date };
  isTimeConflict(otherTimetable: ITimetable): boolean;
  getDurationMinutes(): number;
}

const timetableSchema = new Schema<ITimetable>({
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
    validate: {
      validator: async function(v: mongoose.Types.ObjectId) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'teacher' && user.isActive;
      },
      message: 'Teacher must be an active user with teacher role'
    }
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true,
    maxlength: [50, 'Room name cannot exceed 50 characters']
  },
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: [0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
    max: [6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'],
    validate: {
      validator: function(v: string) {
        return v < this.endTime;
      },
      message: 'Start time must be before end time'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'],
    validate: {
      validator: function(v: string) {
        return v > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  semester: {
    type: Schema.Types.ObjectId,
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
        validator: function(v: [number, number]) {
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
timetableSchema.index({ subject: 1 });
timetableSchema.index({ teacher: 1 });
timetableSchema.index { semester: 1 };
timetableSchema.index({ dayOfWeek: 1, startTime: 1 });
timetableSchema.index({ isActive: 1 });
timetableSchema.index({ location: '2dsphere' });

// Compound indexes for conflict detection
timetableSchema.index(
  { teacher: 1, dayOfWeek: 1, startTime: 1, endTime: 1 },
  { name: 'teacher_schedule_conflict' }
);

timetableSchema.index(
  { room: 1, dayOfWeek: 1, startTime: 1, endTime: 1 },
  { name: 'room_schedule_conflict' }
);

// Virtual fields
timetableSchema.virtual('subjectInfo', {
  ref: 'Subject',
  localField: 'subject',
  foreignField: '_id',
  justOne: true
});

timetableSchema.virtual('teacherInfo', {
  ref: 'User',
  localField: 'teacher',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email'
});

timetableSchema.virtual('semesterInfo', {
  ref: 'Semester',
  localField: 'semester',
  foreignField: '_id',
  justOne: true
});

timetableSchema.virtual('periods', {
  ref: 'Period',
  localField: '_id',
  foreignField: 'timetable',
  count: true
});

// Instance methods
timetableSchema.methods.getTimeRange = function(): { start: Date; end: Date } {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);

  const [startHour, startMinute] = this.startTime.split(':').map(Number);
  const [endHour, endMinute] = this.endTime.split(':').map(Number);

  startDate.setHours(startHour, startMinute, 0, 0);
  endDate.setHours(endHour, endMinute, 0, 0);

  return { start: startDate, end: endDate };
};

timetableSchema.methods.isTimeConflict = function(otherTimetable: ITimetable): boolean {
  if (this.dayOfWeek !== otherTimetable.dayOfWeek) {
    return false;
  }

  const thisStart = this.stringToMinutes(this.startTime);
  const thisEnd = this.stringToMinutes(this.endTime);
  const otherStart = this.stringToMinutes(otherTimetable.startTime);
  const otherEnd = this.stringToMinutes(otherTimetable.endTime);

  return !(
    thisEnd <= otherStart || thisStart >= otherEnd
  );
};

timetableSchema.methods.getDurationMinutes = function(): number {
  const start = this.stringToMinutes(this.startTime);
  const end = this.stringToMinutes(this.endTime);
  return end - start;
};

timetableSchema.methods.stringToMinutes = function(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Pre-save middleware
timetableSchema.pre('save', async function(next) {
  // Validate subject exists and is active
  if (this.isNew || this.isModified('subject')) {
    const subject = await mongoose.model('Subject').findById(this.subject);
    if (!subject || !subject.isActive) {
      const error = new Error('Subject must exist and be active');
      return next(error);
    }
  }

  // Validate teacher exists and is active
  if (this.isNew || this.isModified('teacher')) {
    const teacher = await mongoose.model('User').findById(this.teacher);
    if (!teacher || teacher.role !== 'teacher' || !teacher.isActive) {
      const error = new Error('Teacher must exist, be active, and have teacher role');
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

  // Check for teacher schedule conflicts
  if (this.isNew || this.isModified('teacher') || this.isModified('dayOfWeek') ||
      this.isModified('startTime') || this.isModified('endTime')) {
    const conflict = await mongoose.model('Timetable').findOne({
      _id: { $ne: this._id },
      teacher: this.teacher,
      dayOfWeek: this.dayOfWeek,
      semester: this.semester,
      isActive: true,
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime }
        }
      ]
    });

    if (conflict) {
      const error = new Error('Teacher has a schedule conflict at this time');
      return next(error);
    }
  }

  // Check for room conflicts
  if (this.isNew || this.isModified('room') || this.isModified('dayOfWeek') ||
      this.isModified('startTime') || this.isModified('endTime')) {
    const conflict = await mongoose.model('Timetable').findOne({
      _id: { $ne: this._id },
      room: this.room,
      dayOfWeek: this.dayOfWeek,
      semester: this.semester,
      isActive: true,
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime }
        }
      ]
    });

    if (conflict) {
      const error = new Error('Room is already booked at this time');
      return next(error);
    }
  }

  next();
});

// Pre-remove middleware
timetableSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Archive or cancel future periods
  await mongoose.model('Period').updateMany(
    { timetable: this._id, startTime: { $gte: new Date() } },
    {
      status: 'cancelled',
      isActive: false,
      cancelledAt: new Date(),
      cancelReason: 'Timetable deleted'
    }
  );
});

// Static methods
timetableSchema.statics.findByTeacher = function(
  teacherId: mongoose.Types.ObjectId,
  semesterId?: mongoose.Types.ObjectId
) {
  const query: any = { teacher: teacherId, isActive: true };
  if (semesterId) {
    query.semester = semesterId;
  }

  return this.find(query)
    .populate('subject', 'name code')
    .populate('semester', 'name academicYear')
    .sort({ dayOfWeek: 1, startTime: 1 });
};

timetableSchema.statics.findBySemester = function(semesterId: mongoose.Types.ObjectId) {
  return this.find({ semester: semesterId, isActive: true })
    .populate('teacher', 'firstName lastName email')
    .populate('subject', 'name code credits')
    .sort({ dayOfWeek: 1, startTime: 1 });
};

timetableSchema.statics.findByRoom = function(
  room: string,
  semesterId?: mongoose.Types.ObjectId
) {
  const query: any = { room: room.trim(), isActive: true };
  if (semesterId) {
    query.semester = semesterId;
  }

  return this.find(query)
    .populate('teacher', 'firstName lastName')
    .populate('subject', 'name code')
    .sort({ dayOfWeek: 1, startTime: 1 });
};

timetableSchema.statics.findCurrent = function(teacherId?: mongoose.Types.ObjectId) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const query: any = {
    dayOfWeek: currentDay,
    startTime: { $lte: currentTime },
    endTime: { $gte: currentTime },
    isActive: true
  };

  if (teacherId) {
    query.teacher = teacherId;
  }

  return this.find(query)
    .populate('teacher', 'firstName lastName email')
    .populate('subject', 'name code')
    .populate('semester', 'name academicYear');
};

timetableSchema.statics.getWeeklySchedule = function(
  semesterId: mongoose.Types.ObjectId,
  teacherId?: mongoose.Types.ObjectId
) {
  const query: any = { semester: semesterId, isActive: true };
  if (teacherId) {
    query.teacher = teacherId;
  }

  return this.find(query)
    .populate('teacher', 'firstName lastName email')
    .populate('subject', 'name code credits')
    .sort({ dayOfWeek: 1, startTime: 1 });
};

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);