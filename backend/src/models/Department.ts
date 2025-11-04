import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: mongoose.Types.ObjectId;
  programs: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getProgramCount(): number;
}

const departmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2,6}$/, 'Department code must be 2-6 uppercase letters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  headOfDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(v: mongoose.Types.ObjectId) {
        if (!v) return true;
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'hod';
      },
      message: 'Head of department must be a user with HOD role'
    }
  },
  programs: [{
    type: Schema.Types.ObjectId,
    ref: 'Program'
  }],
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
departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ headOfDepartment: 1 });

// Virtual fields
departmentSchema.virtual('programCount', {
  ref: 'Program',
  localField: 'programs',
  foreignField: '_id',
  count: true
});

// Instance methods
departmentSchema.methods.getProgramCount = function(): number {
  return this.programs ? this.programs.length : 0;
};

// Pre-remove middleware to handle cascading deletes
departmentSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Remove reference from users in this department
  await mongoose.model('User').updateMany(
    { department: this._id },
    { $unset: { department: 1 } }
  );

  // Archive or update programs belonging to this department
  await mongoose.model('Program').updateMany(
    { department: this._id },
    { isActive: false }
  );
});

// Static methods
departmentSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase() });
};

departmentSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);