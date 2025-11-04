import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: any;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getTypedValue(): any;
  updateValue(newValue: any): Promise<void>;
}

const systemConfigSchema = new Schema<ISystemConfig>({
  key: {
    type: String,
    required: [true, 'Configuration key is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Key cannot exceed 100 characters'],
    match: [/^[a-z_][a-z0-9_]*$/, 'Key must contain only lowercase letters, numbers, and underscores, and start with a letter or underscore']
  },
  value: {
    type: Schema.Types.Mixed,
    required: [true, 'Configuration value is required']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['attendance', 'notifications', 'security', 'system', 'qr', 'location', 'email', 'sms'],
    lowercase: true,
    trim: true
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
systemConfigSchema.index({ key: 1 }, { unique: true });
systemConfigSchema.index({ category: 1 });
systemConfigSchema.index({ isActive: 1 });

// Instance methods
systemConfigSchema.methods.getTypedValue = function(): any {
  // Return value with appropriate type based on key or category
  const typeMap: { [key: string]: 'string' | 'number' | 'boolean' | 'array' | 'object' } = {
    // QR Settings
    'qr_expiry_minutes': 'number',
    'qr_size_pixels': 'number',
    'qr_error_correction': 'string',
    'encryption_key_rotation_days': 'number',

    // Location Settings
    'default_geofence_radius': 'number',
    'gps_accuracy_threshold': 'number',
    'max_gps_retry_attempts': 'number',
    'location_timeout_ms': 'number',
    'geofence_buffer_meters': 'number',

    // Attendance Settings
    'minimum_attendance_percentage': 'number',
    'early_grace_minutes': 'number',
    'late_grace_minutes': 'number',
    'late_acceptance_minutes': 'number',

    // Security Settings
    'min_password_length': 'number',
    'password_require_uppercase': 'boolean',
    'password_require_lowercase': 'boolean',
    'password_require_numbers': 'boolean',
    'password_require_special_chars': 'boolean',
    'max_login_attempts': 'number',
    'lockout_duration_minutes': 'number',
    'password_reset_expiry_hours': 'number',

    // Rate Limiting
    'rate_limit_window_ms': 'number',
    'rate_limit_max_requests': 'number',
    'qr_generation_rate_limit': 'number',
    'scan_rate_limit': 'number',

    // Boolean Settings
    'location_validation_enabled': 'boolean',
    'device_fingerprinting_enabled': 'boolean',
    'duplicate_scan_prevention': 'boolean',
    'auto_generate_periods': 'boolean',
    'attendance_alert_enabled': 'boolean',
    'email_notifications_enabled': 'boolean',
    'sms_notifications_enabled': 'boolean',

    // Array Settings
    'allowed_email_domains': 'array',
    'admin_emails': 'array'
  };

  const expectedType = typeMap[this.key] || typeof this.value;

  switch (expectedType) {
    case 'number':
      return Number(this.value);
    case 'boolean':
      return Boolean(this.value);
    case 'string':
      return String(this.value);
    case 'array':
      return Array.isArray(this.value) ? this.value : [];
    case 'object':
      return typeof this.value === 'object' && !Array.isArray(this.value) ? this.value : {};
    default:
      return this.value;
  }
};

systemConfigSchema.methods.updateValue = async function(newValue: any): Promise<void> {
  this.value = newValue;
  await this.save();
};

// Pre-save middleware
systemConfigSchema.pre('save', function(next) {
  // Validate value type based on key
  const key = this.key;
  const value = this.value;

  // Type validation based on key patterns
  if (key.includes('minutes') || key.includes('hours') || key.includes('ms')) {
    if (typeof value !== 'number' || value < 0) {
      const error = new Error(`${key} must be a positive number`);
      return next(error);
    }
  }

  if (key.includes('enabled') || key.includes('require')) {
    if (typeof value !== 'boolean') {
      const error = new Error(`${key} must be a boolean value`);
      return next(error);
    }
  }

  if (key.includes('percentage') || key.includes('radius') || key.includes('threshold')) {
    if (typeof value !== 'number' || value < 0 || value > 100) {
      const error = new Error(`${key} must be a number between 0 and 100`);
      return next(error);
    }
  }

  if (key.includes('pixels') || key.includes('attempts') || key.includes('length')) {
    if (typeof value !== 'number' || value < 1) {
      const error = new Error(`${key} must be a positive integer`);
      return next(error);
    }
  }

  if (key.includes('domains') || key.includes('emails')) {
    if (!Array.isArray(value)) {
      const error = new Error(`${key} must be an array`);
      return next(error);
    }
    if (value.some((item: any) => typeof item !== 'string')) {
      const error = new Error(`${key} must be an array of strings`);
      return next(error);
    }
  }

  next();
});

// Static methods
systemConfigSchema.statics.findByKey = function(key: string) {
  return this.findOne({ key: key, isActive: true });
};

systemConfigSchema.statics.findByCategory = function(category: string) {
  return this.find({ category: category, isActive: true })
    .sort({ key: 1 });
};

systemConfigSchema.statics.getValue = async function(key: string, defaultValue?: any) {
  const config = await this.findOne({ key: key, isActive: true });
  if (config) {
    return config.getTypedValue();
  }
  return defaultValue;
};

systemConfigSchema.statics.setValue = async function(key: string, value: any, description?: string) {
  const config = await this.findOneAndUpdate(
    { key: key },
    {
      $set: {
        value: value,
        description: description,
        isActive: true
      }
    },
    { upsert: true, new: true }
  );
  return config;
};

systemConfigSchema.statics.getAllConfigs = function(category?: string) {
  const query: any = { isActive: true };
  if (category) {
    query.category = category;
  }

  return this.find(query)
    .sort({ category: 1, key: 1 });
};

systemConfigSchema.statics.getConfigsByCategory = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        configs: {
          $push: {
            key: '$key',
            value: '$value',
            description: '$description'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

systemConfigSchema.statics.validateConfigs = function() {
  // Return all required configurations with their defaults
  return {
    // QR Settings
    qr_expiry_minutes: { default: 3, type: 'number', required: true },
    qr_size_pixels: { default: 300, type: 'number', required: true },
    qr_error_correction: { default: 'M', type: 'string', required: true },
    encryption_key_rotation_days: { default: 30, type: 'number', required: true },

    // Location Settings
    default_geofence_radius: { default: 100, type: 'number', required: true },
    gps_accuracy_threshold: { default: 50, type: 'number', required: true },
    max_gps_retry_attempts: { default: 3, type: 'number', required: true },
    location_timeout_ms: { default: 10000, type: 'number', required: true },
    geofence_buffer_meters: { default: 5, type: 'number', required: true },

    // Attendance Settings
    minimum_attendance_percentage: { default: 75, type: 'number', required: true },
    early_grace_minutes: { default: 10, type: 'number', required: true },
    late_grace_minutes: { default: 5, type: 'number', required: true },
    late_acceptance_minutes: { default: 15, type: 'number', required: true },

    // Security Settings
    min_password_length: { default: 8, type: 'number', required: true },
    password_require_uppercase: { default: true, type: 'boolean', required: true },
    password_require_lowercase: { default: true, type: 'boolean', required: true },
    password_require_numbers: { default: true, type: 'boolean', required: true },
    password_require_special_chars: { default: true, type: 'boolean', required: true },
    max_login_attempts: { default: 5, type: 'number', required: true },
    lockout_duration_minutes: { default: 15, type: 'number', required: true },
    password_reset_expiry_hours: { default: 24, type: 'number', required: true },

    // Boolean Settings
    location_validation_enabled: { default: true, type: 'boolean', required: true },
    device_fingerprinting_enabled: { default: true, type: 'boolean', required: true },
    duplicate_scan_prevention: { default: true, type: 'boolean', required: true },
    auto_generate_periods: { default: true, type: 'boolean', required: true },
    attendance_alert_enabled: { default: true, type: 'boolean', required: true },

    // Rate Limiting
    rate_limit_window_ms: { default: 900000, type: 'number', required: true }, // 15 minutes
    rate_limit_max_requests: { default: 100, type: 'number', required: true },
    qr_generation_rate_limit: { default: 10, type: 'number', required: true },
    scan_rate_limit: { default: 5, type: 'number', required: true }
  };
};

systemConfigSchema.statics.initializeDefaults = async function() {
  const requiredConfigs = this.validateConfigs();

  for (const [key, config] of Object.entries(requiredConfigs)) {
    const exists = await this.findOne({ key: key });
    if (!exists) {
      await this.create({
        key: key,
        value: config.default,
        category: this.getCategoryFromKey(key),
        isActive: true
      });
    }
  }
};

// Helper method to determine category from key
systemConfigSchema.statics.getCategoryFromKey = function(key: string): string {
  if (key.includes('qr')) return 'qr';
  if (key.includes('geofence') || key.includes('location') || key.includes('gps')) return 'location';
  if (key.includes('password') || key.includes('login') || key.includes('lockout')) return 'security';
  if (key.includes('attendance') || key.includes('grace')) return 'attendance';
  if (key.includes('rate_limit')) return 'security';
  if (key.includes('email')) return 'email';
  if (key.includes('sms')) return 'sms';
  return 'system';
};

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);