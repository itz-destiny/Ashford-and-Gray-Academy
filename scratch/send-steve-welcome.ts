import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
    const dbConnect = (await import('@/lib/mongodb')).default;
    const { issueMagicLoginLink } = await import('@/lib/magic-login');
    const { sendEmail, emailTemplates } = await import('@/lib/email');
    const { getEmailUrl } = await import('@/lib/app-url');

    await dbConnect();

    const uid = 'YAuuo3caloTxM40wd2Ofg2JhAR33';
    const email = 'steve.onyebuchi@ashfordandgrayfusionacademy.com';
    const displayName = 'Mr Steve Iyke Onyebuchi';
    const password = 'AGFA-Mr-Onyebuchi-2026';

    const magicLoginUrl = await issueMagicLoginLink(uid);
    const appUrl = getEmailUrl();

    const tpl = emailTemplates.staffWelcome({
        recipientName: displayName,
        email,
        password,
        loginUrl: `${appUrl}/login`,
        roleTitle: 'Instructor',
        magicLoginUrl,
    });

    const result = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
    console.log(JSON.stringify(result, null, 2));
    console.log('magicLoginUrl:', magicLoginUrl);
    process.exit(result.success ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
