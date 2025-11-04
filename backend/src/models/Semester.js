const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Semester name is required'],
    trim: true,
    maxlength: [50, 'Semester name cannot exceed 50 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(v) {
        return v <= this.endDate;
      },
      message: 'Start date must be before or equal to end date'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        return v >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'],
    validate: {
      validator: function(v) {
        const [startYear, endYear] = v.split('-').map(Number);
        return endYear === startYear + 1;
      },
      message: 'Academic year end year must be one year after start year'
    }
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
semesterSchema.index({ program: 1, academicYear: 1 });
semesterSchema.index({ isActive: 1 });
semesterSchema.index({ isCurrent: 1 });
semesterSchema.index({ startDate: 1 });
semesterSchema.index({ endDate: 1 });

// Compound index for uniqueness
semesterSchema.index(
  { program: 1, name: 1, academicYear: 1 },
  { unique: true }
);

// Virtual fields
semesterSchema.virtual('duration', {
  ref: 'Period',
  localField: '_id',
  foreignField: 'semester',
  count: true
});

semesterSchema.virtual('programName', {
  ref: 'Program',
  localField: 'program',
  foreignField: '_id',
  justOne: true
});

// Instance methods
semesterSchema.methods.getDurationDays = function() {
  const timeDiff = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

semesterSchema.methods.isOverlapping = function(startDate, endDate) {
  return (
    (this.startDate <= startDate && this.endDate >= startDate) ||
    (this.startDate <= endDate && this.endDate >= endDate) ||
    (startDate <= this.startDate && endDate >= this.endDate)
  );
};

// Pre-save middleware
semesterSchema.pre('save', async function(next) {
  // Validate program exists and is active
  if (this.isNew || this.isModified('program')) {
    const program = await mongoose.model('Program').findById(this.program);
    if (!program || !program.isActive) {
      const error = new Error('Program must exist and be active');
      return next(error);
    }
  }

  // Ensure only one current semester per program
  if (this.isCurrent) {
    await mongoose.model('Semester').updateMany(
      {
        program: this.program,
        _id: { $ne: this._id },
        isCurrent: true
      },
      { isCurrent: false }
    );
  }

  // Check for overlapping semesters
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    const overlapping = await mongoose.model('Semester').findOne({
      program: this.program,
      _id: { $ne: this._id },
      $or: [
        {
          startDate: { $lte: this.endDate },
          endDate: { $gte: this.startDate }
        }
      ]
    });

    if (overlapping) {
      const error = new Error('Semester dates cannot overlap with existing semesters');
      return next(error);
    }
  }

  next();
});

// Pre-remove middleware
semesterSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Archive related data
  await mongoose.model('Subject').updateMany(
    { semester: this._id },
    { isActive: false }
  );

  await mongoose.model('Timetable').updateMany(
    { semester: this._id },
    { isActive: false }
  );

  await mongoose.model('Period').updateMany(
    { semester: this._id },
    { isActive: false }
  );

  await mongoose.model('StudentEnrollment').updateMany(
    { semester: this._id },
    { isActive: false }
  );
});

// Static methods
semesterSchema.statics.findCurrent = function(programId) {
  const query = { isCurrent: true, isActive: true };
  if (programId) {
    query.program = programId;
  }
  return this.findOne(query).populate('program', 'name code');
};

semesterSchema.statics.findByProgram = function(programId) {
  return this.find({ program: programId, isActive: true })
    .sort({ startDate: -1 })
    .populate('program', 'name code');
};

semesterSchema.statics.findByAcademicYear = function(academicYear) {
  return this.find({ academicYear, isActive: true })
    .sort({ program: 1, startDate: 1 })
    .populate('program', 'name code');
};

semesterSchema.statics.findActive = function() {
  return this.find({ isActive: true, isCurrent: true })
    .sort({ program: 1, startDate: 1 })
    .populate('program', 'name code department');
};

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = { Semester };