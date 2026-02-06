import nodemailer from 'nodemailer';

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: from || `"Ashford & Gray Academy" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}

// Email Templates
export const emailTemplates = {
    enrollment: (data: { studentName: string; courseName: string; courseUrl: string }) => ({
        subject: `Welcome to ${data.courseName}!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 Enrollment Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${data.studentName},</p>
                        <p>Congratulations! You've been successfully enrolled in <strong>${data.courseName}</strong>.</p>
                        <p>You can now access all course materials, lessons, and resources. Start your learning journey today!</p>
                        <a href="${data.courseUrl}" class="button">Start Learning →</a>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Ashford & Gray Fusion Academy. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    newMessage: (data: { recipientName: string; senderName: string; messagePreview: string; conversationUrl: string }) => ({
        subject: `New message from ${data.senderName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .message-preview { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>💬 New Message</h2>
                    </div>
                    <div class="content">
                        <p>Hi ${data.recipientName},</p>
                        <p>You have a new message from <strong>${data.senderName}</strong>:</p>
                        <div class="message-preview">
                            <p>${data.messagePreview}</p>
                        </div>
                        <a href="${data.conversationUrl}" class="button">View Conversation →</a>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    paymentSuccess: (data: { studentName: string; amount: number; courseName: string; transactionId: string }) => ({
        subject: 'Payment Successful - Receipt',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .receipt { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
                    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .total { font-size: 20px; font-weight: bold; color: #10b981; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>✅ Payment Successful</h2>
                    </div>
                    <div class="content">
                        <p>Hi ${data.studentName},</p>
                        <p>Your payment has been processed successfully!</p>
                        <div class="receipt">
                            <div class="receipt-row">
                                <span>Course:</span>
                                <strong>${data.courseName}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Amount:</span>
                                <strong class="total">$${data.amount.toFixed(2)}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Transaction ID:</span>
                                <span>${data.transactionId}</span>
                            </div>
                        </div>
                        <p>Thank you for your purchase!</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    systemAlert: (data: { userName: string; alertTitle: string; alertMessage: string }) => ({
        subject: `System Alert: ${data.alertTitle}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>⚠️ ${data.alertTitle}</h2>
                    </div>
                    <div class="content">
                        <p>Hi ${data.userName},</p>
                        <div class="alert">
                            <p>${data.alertMessage}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};
