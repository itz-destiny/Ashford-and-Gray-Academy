# Gmail Email Notifications Setup Guide

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/security
2. Under "Signing in to Google", select **2-Step Verification**
3. Follow the prompts to enable it (if not already enabled)

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Enter a name like "Ashford & Gray Academy"
6. Click **Generate**
7. Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`)
8. **Copy this password** - you won't be able to see it again!

## Step 3: Add to .env File

Add these lines to your `.env` file (NOT `.env.example`):

```env
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Important Notes:**
- Remove spaces from the app password when pasting
- Use the app password, NOT your regular Gmail password
- Keep this file secure and never commit it to Git

## Step 4: Test Email Sending

You can test the email system by creating a test notification:

```typescript
import { createNotification } from '@/lib/notifications';

await createNotification({
    userId: 'user_id_here',
    type: 'system',
    title: 'Test Notification',
    message: 'This is a test email',
    sendEmail: true,
    userEmail: 'recipient@example.com',
    userName: 'Test User',
    emailData: {
        userName: 'Test User',
        alertTitle: 'Test Alert',
        alertMessage: 'If you receive this, email notifications are working!'
    }
});
```

## Troubleshooting

### "Invalid login" error
- Make sure you're using the App Password, not your regular password
- Verify 2-Step Verification is enabled
- Check that there are no spaces in the app password

### Emails not sending
- Check your `.env` file has the correct variables
- Restart your dev server after adding env variables
- Check the console for error messages
- Verify the recipient email is valid

### Gmail blocking emails
- Gmail may temporarily block if you send too many emails quickly
- Consider using a dedicated email service (Resend, SendGrid) for production

## Future: Switching to Resend

Once you have your domain, you can easily switch to Resend:

1. Sign up at https://resend.com
2. Verify your domain
3. Get your API key
4. Update `.env`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```
5. Update `src/lib/email.ts` to use Resend instead of Nodemailer

The notification system will work the same way!
