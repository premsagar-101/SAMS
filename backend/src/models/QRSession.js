const mongoose = require('mongoose');

const qrSessionSchema = new mongoose.Schema({
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, 'Period is required'],
    unique: true
  },
  qrCode: {
    type: String,
    required: [true, 'QR code is required'],
    maxlength: [1000, 'QR code data cannot exceed 1000 characters']
  },
  qrImage: {
    type: String, // URL to generated QR image
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'QR image must be a valid URL'
    }
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry time is required'],
    validate: {
      validator: function(v) {
        return v > this.generatedAt;
      },
      message: 'Expiry time must be after generation time'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalScans: {
    type: Number,
    default: 0,
    min: [0, 'Total scans cannot be negative']
  },
  uniqueStudents: {
    type: Number,
    default: 0,
    min: [0, 'Unique students cannot be negative']
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
    max: [1000, 'Geofence radius cannot exceed 1000 meters']
  },
  gracePeriodMinutes: {
    type: Number,
    default: 5,
    min: [0, 'Grace period cannot be negative'],
    max: [60, 'Grace period cannot exceed 60 minutes']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
qrSessionSchema.index({ period: 1 }, { unique: true });
qrSessionSchema.index({ expiresAt: 1 });
qrSessionSchema.index({ isActive: 1 });
qrSessionSchema.index({ location: '2dsphere' });

// TTL index to automatically remove expired documents
qrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours after expiry

// Virtual fields
qrSessionSchema.virtual('periodInfo', {
  ref: 'Period',
  localField: 'period',
  foreignField: '_id',
  justOne: true
});

qrSessionSchema.virtual('scans', {
  ref: 'Attendance',
  localField: 'period',
  foreignField: 'period',
  count: true
});

// Instance methods
qrSessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

qrSessionSchema.methods.getTimeRemaining = function() {
  const now = new Date().getTime();
  const expiry = this.expiresAt.getTime();
  return Math.max(0, expiry - now);
};

qrSessionSchema.methods.extendExpiry = function(minutes) {
  const newExpiry = new Date(this.expiresAt.getTime() + minutes * 60 * 1000);
  this.expiresAt = newExpiry;
  this.isActive = true;
};

// Pre-save middleware
qrSessionSchema.pre('save', async function(next) {
  // Validate period exists and is active
  if (this.isNew || this.isModified('period')) {
    const period = await mongoose.model('Period').findById(this.period);
    if (!period || !period.isActive) {
      const error = new Error('Period must exist and be active');
      return next(error);
    }

    // Copy location data from period if not provided
    if (this.isNew && (!this.location || !this.geofenceRadius)) {
      this.location = period.location;
      this.geofenceRadius = period.geofenceRadius;
    }

    // Set default expiry if not provided
    if (this.isNew && !this.expiresAt) {
      const defaultMinutes = parseInt(process.env.QR_EXPIRY_MINUTES || '3');
      this.expiresAt = new Date(Date.now() + defaultMinutes * 60 * 1000);
    }

    // Check if period allows QR generation
    if (!period.canGenerateQR()) {
      const error = new Error('QR generation not allowed for this period at this time');
      return next(error);
    }
  }

  // Auto-deactivate if expired
  if (this.isExpired()) {
    this.isActive = false;
  }

  next();
});

// Pre-remove middleware
qrSessionSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Update period to reflect QR session deletion
  await mongoose.model('Period').updateOne(
    { _id: this.period },
    {
      $set: {
        qrGenerated: false,
        qrGeneratedAt: null,
        qrExpiresAt: null
      }
    }
  );
});

// Static methods
qrSessionSchema.statics.findByPeriod = function(periodId) {
  return this.findOne({ period: periodId })
    .populate({
      path: 'period',
      populate: [
        { path: 'subject', select: 'name code' },
        { path: 'teacher', select: 'firstName lastName email' }
      ]
    });
};

qrSessionSchema.statics.findActive = function() {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() }
  })
  .populate({
    path: 'period',
    populate: [
      { path: 'subject', select: 'name code' },
      { path: 'teacher', select: 'firstName lastName email' }
    ]
  })
  .sort({ expiresAt: 1 });
};

qrSessionSchema.statics.findActiveByTeacher = function(teacherId) {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() }
  })
  .populate({
    path: 'period',
    match: { teacher: teacherId, isActive: true },
    populate: [
      { path: 'subject', select: 'name code' },
      { path: 'semester', select: 'name academicYear' }
    ]
  })
  .sort({ expiresAt: 1 });
};

qrSessionSchema.statics.createOrUpdate = async function(periodId) {
  // Check if active session exists
  let session = await this.findOne({
    period: periodId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });

  if (session) {
    // Extend existing session
    const defaultMinutes = parseInt(process.env.QR_EXPIRY_MINUTES || '3');
    session.extendExpiry(defaultMinutes);
    await session.save();
    return session;
  }

  // Create new session
  const defaultMinutes = parseInt(process.env.QR_EXPIRY_MINUTES || '3');
  const expiresAt = new Date(Date.now() + defaultMinutes * 60 * 1000);

  session = new this({
    period: periodId,
    expiresAt: expiresAt,
    isActive: true
  });

  await session.save();
  return session;
};

qrSessionSchema.statics.getStatsByPeriod = function(periodId) {
  return this.aggregate([
    { $match: { period: periodId } },
    {
      $lookup: {
        from: 'attendance',
        localField: 'period',
        foreignField: 'period',
        as: 'attendance'
      }
    },
    {
      $project: {
        totalScans: { $size: '$attendance' },
        uniqueStudents: {
          $size: { $setUnion: ['$attendance.student', []] }
        },
        sessionDuration: {
          $divide: [
            { $subtract: ['$expiresAt', '$generatedAt'] },
            60000 // Convert to minutes
          ]
        },
        scansPerMinute: {
          $cond: [
            { $eq: [{ $size: '$attendance' }, 0] },
            0,
            {
              $divide: [
                { $size: '$attendance' },
                {
                  $divide: [
                    { $subtract: ['$expiresAt', '$generatedAt'] },
                    60000
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  ]);
};

qrSessionSchema.statics.cleanupExpired = function() {
  const now = new Date();
  return this.updateMany(
    {
      isActive: true,
      expiresAt: { $lte: now }
    },
    {
      $set: { isActive: false }
    }
  );
};

qrSessionSchema.statics.getActiveSessionCount = function() {
  return this.countDocuments({
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

const QRSession = mongoose.model('QRSession', qrSessionSchema);

module.exports = { QRSession };