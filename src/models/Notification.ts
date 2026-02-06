import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['enrollment', 'course_update', 'message', 'payment', 'system', 'grade', 'announcement'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    actionUrl: {
        type: String
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    metadata: {
        courseId: mongoose.Schema.Types.ObjectId,
        transactionId: mongoose.Schema.Types.ObjectId,
        senderId: mongoose.Schema.Types.ObjectId,
        conversationId: mongoose.Schema.Types.ObjectId,
        additionalData: mongoose.Schema.Types.Mixed
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 }); // For cleanup

// Auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
