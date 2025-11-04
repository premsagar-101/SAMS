import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'attendance' | 'low_attendance' | 'reminder' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  sentVia: ('inapp' | 'email' | 'sms')[];
  emailSent: boolean;
  smsSent: boolean;
  createdAt: Date;
  readAt?: Date;

  // Methods
  markAsRead(): void;
  getDeliveryStatus(): string;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    required: [true, 'Notification type is required'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['attendance', 'low_attendance', 'reminder', 'system'],
    required: [true, 'Notification category is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Action URL must be a valid URL'
    }
  },
  sentVia: {
    type: [String],
    enum: ['inapp', 'email', 'sms'],
    default: ['inapp'],
    validate: {
      validator: function(v: string[]) {
        return v.length > 0;
      },
      message: 'At least one delivery channel must be specified'
    }
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ isRead: 1 });

// TTL index to automatically remove old notifications (90 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Virtual fields
notificationSchema.virtual('recipientInfo', {
  ref: 'User',
  localField: 'recipient',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email role'
});

// Instance methods
notificationSchema.methods.markAsRead = function(): void {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
};

notificationSchema.methods.getDeliveryStatus = function(): string {
  const sentChannels = [];
  if (this.sentVia.includes('inapp')) sentChannels.push('In-App');
  if (this.sentVia.includes('email')) sentChannels.push('Email');
  if (this.sentVia.includes('sms')) sentChannels.push('SMS');

  const delivered = [];
  if (this.sentVia.includes('inapp')) delivered.push('In-App');
  if (this.emailSent && this.sentVia.includes('email')) delivered.push('Email');
  if (this.smsSent && this.sentVia.includes('sms')) delivered.push('SMS');

  return `${delivered.join(', ')} (${delivered.length}/${sentChannels.length} delivered)`;
};

// Pre-save middleware
notificationSchema.pre('save', async function(next) {
  // Validate recipient exists and is active
  if (this.isNew || this.isModified('recipient')) {
    const user = await mongoose.model('User').findById(this.recipient);
    if (!user || !user.isActive) {
      const error = new Error('Recipient must exist and be active');
      return next(error);
    }
  }

  // Auto-mark as read if being marked as read
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }

  next();
});

// Static methods
notificationSchema.statics.findByRecipient = function(
  recipientId: mongoose.Types.ObjectId,
  options: {
    unreadOnly?: boolean;
    category?: string;
    limit?: number;
    page?: number;
  } = {}
) {
  const query: any = { recipient: recipientId };

  if (options.unreadOnly) {
    query.isRead = false;
  }

  if (options.category) {
    query.category = options.category;
  }

  const limit = options.limit || 20;
  const page = options.page || 1;
  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

notificationSchema.statics.findUnreadCount = function(recipientId: mongoose.Types.ObjectId) {
  return this.countDocuments({
    recipient: recipientId,
    isRead: false
  });
};

notificationSchema.statics.markAsRead = function(
  recipientId: mongoose.Types.ObjectId,
  notificationIds?: mongoose.Types.ObjectId[]
) {
  const query: any = {
    recipient: recipientId,
    isRead: false
  };

  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }

  return this.updateMany(
    query,
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

notificationSchema.statics.createNotification = async function(data: {
  recipient: mongoose.Types.ObjectId;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'attendance' | 'low_attendance' | 'reminder' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  sentVia?: ('inapp' | 'email' | 'sms')[];
}) {
  const notification = new this({
    ...data,
    sentVia: data.sentVia || ['inapp']
  });

  await notification.save();

  // Trigger notification delivery process
  // This would be handled by a notification service
  if (notification.sentVia.includes('email')) {
    // Queue email delivery
  }

  if (notification.sentVia.includes('sms')) {
    // Queue SMS delivery
  }

  return notification;
};

notificationSchema.statics.broadcastNotification = async function(data: {
  recipients?: mongoose.Types.ObjectId[];
  roles?: ('student' | 'teacher' | 'hod' | 'admin')[];
  departments?: mongoose.Types.ObjectId[];
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'attendance' | 'low_attendance' | 'reminder' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  sentVia?: ('inapp' | 'email' | 'sms')[];
}) {
  let recipientQuery: any = { isActive: true };

  if (data.recipients && data.recipients.length > 0) {
    recipientQuery._id = { $in: data.recipients };
  } else {
    if (data.roles && data.roles.length > 0) {
      recipientQuery.role = { $in: data.roles };
    }

    if (data.departments && data.departments.length > 0) {
      recipientQuery.department = { $in: data.departments };
    }
  }

  const recipients = await mongoose.model('User').find(recipientQuery, '_id');
  const recipientIds = recipients.map(r => r._id);

  const notifications = recipientIds.map(recipientId => ({
    recipient: recipientId,
    type: data.type,
    category: data.category,
    title: data.title,
    message: data.message,
    actionUrl: data.actionUrl,
    sentVia: data.sentVia || ['inapp']
  }));

  return this.insertMany(notifications);
};

notificationSchema.statics.getNotificationStats = function(recipientId?: mongoose.Types.ObjectId) {
  const matchQuery: any = {};
  if (recipientId) {
    matchQuery.recipient = recipientId;
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          type: '$type',
          category: '$category',
          isRead: '$isRead'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          type: '$_id.type',
          category: '$_id.category'
        },
        total: { $sum: '$count' },
        read: {
          $sum: {
            $cond: [{ $eq: ['$_id.isRead', true] }, '$count', 0]
          }
        },
        unread: {
          $sum: {
            $cond: [{ $eq: ['$_id.isRead', false] }, '$count', 0]
          }
        }
      }
    },
    {
      $addFields: {
        readPercentage: {
          $multiply: [
            { $divide: ['$read', '$total'] },
            100
          ]
        }
      }
    },
    {
      $sort: { '_id.type': 1, '_id.category': 1 }
    }
  ]);
};

notificationSchema.statics.cleanupOldNotifications = function(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true // Only delete read notifications
  });
};

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);