import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export interface SendEmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: SendEmailOptions) => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn('Gmail credentials not configured. Skipping email.');
        return null;
    }

    const mailOptions = {
        from: `"Ashford & Gray Academy" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
