import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  credits: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getCreditHours(): string;
}

const subjectSchema = new Schema<ISubject>({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Subject code must be in format like CS201 or MATH301']
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
subjectSchema.index({ code: 1 }, { unique: true });
subjectSchema.index({ department: 1 });
subjectSchema.index({ semester: 1 });
subjectSchema.index({ isActive: 1 });
subjectSchema.index({ name: 1 });

// Compound index for uniqueness within department
subjectSchema.index(
  { department: 1, code: 1 },
  { unique: true }
);

// Virtual fields
subjectSchema.virtual('enrollments', {
  ref: 'StudentEnrollment',
  localField: '_id',
  foreignField: 'subject',
  count: true
});

subjectSchema.virtual('timetableEntries', {
  ref: 'Timetable',
  localField: '_id',
  foreignField: 'subject',
  count: true
});

subjectSchema.virtual('departmentName', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

subjectSchema.virtual('semesterInfo', {
  ref: 'Semester',
  localField: 'semester',
  foreignField: '_id',
  justOne: true
});

// Instance methods
subjectSchema.methods.getCreditHours = function(): string {
  return this.credits === 1 ? '1 credit hour' : `${this.credits} credit hours`;
};

// Pre-save middleware
subjectSchema.pre('save', async function(next) {
  // Validate department exists and is active
  if (this.isNew || this.isModified('department')) {
    const department = await mongoose.model('Department').findById(this.department);
    if (!department || !department.isActive) {
      const error = new Error('Department must exist and be active');
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

    // Ensure semester belongs to same department as subject
    const semesterProgram = await mongoose.model('Program').findById(semester.program);
    if (!semesterProgram || !semesterProgram.department.equals(this.department)) {
      const error = new Error('Subject must belong to same department as semester program');
      return next(error);
    }
  }

  next();
});

// Pre-remove middleware
subjectSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Archive related data
  await mongoose.model('StudentEnrollment').updateMany(
    { subject: this._id },
    { isActive: false }
  );

  await mongoose.model('Timetable').updateMany(
    { subject: this._id },
    { isActive: false }
  );

  await mongoose.model('Period').updateMany(
    { subject: this._id },
    { isActive: false }
  );

  await mongoose.model('Attendance').updateMany(
    { subject: this._id },
    { $set: {
      'archived': true,
      'archivedAt': new Date(),
      'archiveReason': 'Subject deleted'
    }}
  );
});

// Static methods
subjectSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase() });
};

subjectSchema.statics.findByDepartment = function(departmentId: mongoose.Types.ObjectId) {
  return this.find({ department: departmentId, isActive: true })
    .sort({ code: 1 });
};

subjectSchema.statics.findBySemester = function(semesterId: mongoose.Types.ObjectId) {
  return this.find({ semester: semesterId, isActive: true })
    .sort({ code: 1 })
    .populate('department', 'name code');
};

subjectSchema.statics.findByProgram = function(programId: mongoose.Types.ObjectId) {
  return this.find({
    isActive: true
  })
  .populate({
    path: 'semester',
    match: { program: programId, isActive: true }
  })
  .populate('department', 'name code')
  .sort({ code: 1 });
};

subjectSchema.statics.findActive = function() {
  return this.find({ isActive: true })
    .populate('department', 'name code')
    .populate('semester', 'name academicYear')
    .sort({ department: 1, code: 1 });
};

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);