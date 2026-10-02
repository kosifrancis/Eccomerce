const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('[EmailService] RESEND_API_KEY is missing in environment variables.');
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
};

/**
 * Sends a password reset OTP email using Resend
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.otp - The 6-digit OTP code
 * @param {string} [options.username] - User's name
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
const sendPasswordResetEmail = async ({ to, otp, username = 'Valued Customer' }) => {
    try {
        const resend = getResendClient();
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'Ecommerce <onboarding@resend.dev>';

        const subject = 'Your Password Reset Code';

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f9fb;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #eef0f3;
    }
    .header {
      background: #111827;
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1f2937;
    }
    .message {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 28px;
    }
    .otp-wrapper {
      text-align: center;
      margin: 28px 0;
    }
    .otp-box {
      display: inline-block;
      font-family: 'Courier New', Courier, monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 8px;
      background-color: #f3f4f6;
      color: #111827;
      padding: 16px 28px;
      border-radius: 8px;
      border: 1px dashed #d1d5db;
    }
    .validity {
      font-size: 13px;
      color: #6b7280;
      margin-top: 10px;
      text-align: center;
    }
    .security-note {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 14px 16px;
      border-radius: 4px;
      font-size: 13px;
      color: #991b1b;
      margin-top: 24px;
      line-height: 1.5;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Security Verification</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${username},</div>
      <div class="message">
        We received a request to reset the password for your account. Use the verification code below to complete the password reset process:
      </div>
      <div class="otp-wrapper">
        <div class="otp-box">${otp}</div>
        <div class="validity">This code will expire in <strong>10 minutes</strong>.</div>
      </div>
      <div class="security-note">
        <strong>Security Notice:</strong> If you did not make this request, you can safely ignore this email. Your password will remain unchanged and your account is secure.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Ecommerce. All rights reserved.
    </div>
  </div>
</body>
</html>
        `.trim();

        const textContent = `Hello ${username},\n\nWe received a request to reset your password. Use the verification code below:\n\nOTP Code: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

        const response = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject,
            html: htmlContent,
            text: textContent
        });

        if (response.error) {
            console.error('[EmailService] Resend API error:', response.error);
            return {
                success: false,
                error: response.error
            };
        }

        console.log(`[EmailService] Password reset email sent to ${to}. Email ID:`, response.data?.id);
        return {
            success: true,
            data: response.data
        };
    } catch (err) {
        console.error('[EmailService] Exception while sending email:', err);
        return {
            success: false,
            error: err
        };
    }
};

module.exports = {
    sendPasswordResetEmail,
    getResendClient
};
