const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true,
    maxlength: [100, 'Program name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Program code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2,8}$/, 'Program code must be 2-8 uppercase letters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  duration: {
    type: Number,
    required: [true, 'Program duration is required'],
    min: [1, 'Duration must be at least 1 year'],
    max: [10, 'Duration cannot exceed 10 years']
  },
  totalSemesters: {
    type: Number,
    required: [true, 'Total semesters is required'],
    min: [1, 'Must have at least 1 semester'],
    max: [20, 'Cannot exceed 20 semesters'],
    validate: {
      validator: function(v) {
        return v % 2 === 0; // Usually even number of semesters
      },
      message: 'Total semesters should be an even number'
    }
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
programSchema.index({ code: 1 }, { unique: true });
programSchema.index({ department: 1 });
programSchema.index({ isActive: 1 });
programSchema.index({ name: 1 });

// Virtual fields
programSchema.virtual('departmentName', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Instance methods
programSchema.methods.getDurationString = function() {
  const years = this.duration;
  return years === 1 ? '1 year' : `${years} years`;
};

// Pre-save middleware for validation
programSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('department')) {
    const department = await mongoose.model('Department').findById(this.department);
    if (!department || !department.isActive) {
      const error = new Error('Department must exist and be active');
      return next(error);
    }
  }
  next();
});

// Pre-remove middleware
programSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Remove program from department's programs array
  await mongoose.model('Department').updateOne(
    { _id: this.department },
    { $pull: { programs: this._id } }
  );

  // Archive or update related semesters and subjects
  await mongoose.model('Semester').updateMany(
    { program: this._id },
    { isActive: false }
  );

  await mongoose.model('Subject').updateMany(
    { program: this._id },
    { isActive: false }
  );
});

// Static methods
programSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

programSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isActive: true });
};

programSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('department', 'name code');
};

const Program = mongoose.model('Program', programSchema);

module.exports = { Program };