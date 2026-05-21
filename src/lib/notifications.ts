import { Notification } from '@/models/Notification';
import { sendEmail, emailTemplates } from './email';
import dbConnect from './mongodb';
import { publishNotification, markNotificationReadInFirestore, markAllNotificationsReadForUser } from './realtime-events';

interface CreateNotificationParams {
    userId: string;
    type: 'enrollment' | 'course_update' | 'message' | 'payment' | 'system' | 'grade' | 'announcement';
    title: string;
    message: string;
    actionUrl?: string;
    sendEmail?: boolean;
    emailData?: any;
    userEmail?: string;
    userName?: string;
    metadata?: {
        courseId?: string;
        transactionId?: string;
        senderId?: string;
        conversationId?: string;
        additionalData?: any;
    };
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        await dbConnect();

        // Create in-app notification
        const notification = await Notification.create({
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            actionUrl: params.actionUrl,
            metadata: params.metadata,
            emailSent: false
        });

        // Mirror to Firestore so the user's NotificationBell updates in
        // real time without polling. Fire-and-forget.
        void publishNotification({
            notificationId: String(notification._id),
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.actionUrl,
            createdAt: notification.createdAt instanceof Date ? notification.createdAt : new Date(),
            isRead: false,
        });

        // Send email if requested and email data provided
        if (params.sendEmail && params.userEmail && params.emailData) {
            let emailResult;

            switch (params.type) {
                case 'enrollment':
                    const enrollmentEmail = emailTemplates.enrollment(params.emailData);
                    emailResult = await sendEmail({
                        to: params.userEmail,
                        subject: enrollmentEmail.subject,
                        html: enrollmentEmail.html
                    });
                    break;

                case 'message':
                    const messageEmail = emailTemplates.newMessage(params.emailData);
                    emailResult = await sendEmail({
                        to: params.userEmail,
                        subject: messageEmail.subject,
                        html: messageEmail.html
                    });
                    break;

                case 'payment':
                    const paymentEmail = emailTemplates.paymentSuccess(params.emailData);
                    emailResult = await sendEmail({
                        to: params.userEmail,
                        subject: paymentEmail.subject,
                        html: paymentEmail.html
                    });
                    break;

                case 'system':
                    const systemEmail = emailTemplates.systemAlert(params.emailData);
                    emailResult = await sendEmail({
                        to: params.userEmail,
                        subject: systemEmail.subject,
                        html: systemEmail.html
                    });
                    break;
            }

            // Update notification to mark email as sent
            if (emailResult?.success) {
                await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
            }
        }

        return { success: true, notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
    }
}

export async function markAsRead(notificationId: string, userId: string) {
    try {
        await dbConnect();

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true, readAt: new Date() },
            { new: true }
        );

        if (notification) {
            void markNotificationReadInFirestore(String(notification._id));
        }

        return { success: true, notification };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error };
    }
}

export async function markAllAsRead(userId: string) {
    try {
        await dbConnect();

        await Notification.updateMany(
            { userId, read: false },
            { read: true, readAt: new Date() }
        );

        void markAllNotificationsReadForUser(userId);

        return { success: true };
    } catch (error) {
        console.error('Error marking all as read:', error);
        return { success: false, error };
    }
}

export async function getUnreadCount(userId: string) {
    try {
        await dbConnect();
        const count = await Notification.countDocuments({ userId, read: false });
        return count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
}
