const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProviders || this.oauthProviders.length === 0;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['student', 'teacher', 'hod', 'admin'],
      message: 'Role must be one of: student, teacher, hod, admin'
    },
    default: 'student'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return this.role !== 'admin';
    }
  },
  profileImage: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Profile image must be a valid URL'
    }
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number'],
    sparse: true // Allow multiple null values
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  oauthProviders: [{
    provider: {
      type: String,
      enum: ['google', 'microsoft'],
      required: true
    },
    providerId: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'oauthProviders.provider': 1, 'oauthProviders.providerId': 1 });

// Virtual fields
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware for email validation (college domain)
userSchema.pre('save', function(next) {
  if (this.isModified('email') && !this.oauthProviders?.length) {
    const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [];
    if (allowedDomains.length > 0) {
      const domain = this.email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        const error = new Error(`Email domain ${domain} is not allowed`);
        return next(error);
      }
    }
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Custom toJSON method to remove sensitive fields
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.__v;
  return userObject;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByOAuthProvider = function(provider, providerId) {
  return this.findOne({
    'oauthProviders': {
      $elemMatch: { provider, providerId }
    }
  });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };