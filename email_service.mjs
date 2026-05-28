
let nodemailer;
try {
    nodemailer = (await import('nodemailer')).default;
} catch (e) {
    console.warn('[EmailService] nodemailer not found. Please run: npm install nodemailer');
}

/**
 * Email Service for VIETBACHCORP ERP
 * Handles sending automated alert emails.
 */

export async function sendEmailNotification(subject, text, config) {
    if (!config.enabled || !config.smtpUser || !config.smtpPass) {
        console.log('[EmailService] Email notifications are disabled or missing SMTP credentials.');
        return { success: false, message: 'Disabled or missing credentials' };
    }

    const transporter = nodemailer.createTransport({
        host: config.smtpHost || 'smtp.gmail.com',
        port: parseInt(config.smtpPort) || 587,
        secure: parseInt(config.smtpPort) === 465, // Standard: true for 465 (SSL), false for 587 (STARTTLS)
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass
        }
    });

    const isHtml = /<[a-z][\s\S]*>/i.test(text);
    const mailOptions = {
        from: `"${config.senderName || 'VIETBACH ERP Alert'}" <${config.smtpUser}>`,
        to: config.recipientEmails, // Comma separated list
        subject: subject,
        [isHtml ? 'html' : 'text']: text,
        attachments: config.attachments || [] // Support for { filename, content, encoding }
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] Email sent: ' + info.response);
        return { success: true, response: info.response };
    } catch (error) {
        console.error('[EmailService] Error sending email:', error);
        return { success: false, error: error.message };
    }
}
