const nodemailer = require('nodemailer')
require('dotenv').config()

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Generate a cryptographically simple 6-digit OTP.
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send a 2FA sign-in OTP to the given email address.
 */
async function sendOTPEmail(toEmail, otp) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"Verity" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your Verity sign-in code',
    text: `Your one-time sign-in code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #0F0F0F;">Your sign-in code</h2>
        <p style="color: #6B6B6B; font-size: 14px; margin-bottom: 24px;">
          Use the code below to complete signing in to Verity. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background: #F4F4F0; border-radius: 8px; padding: 24px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #0F0F0F;">
          ${otp}
        </div>
        <p style="color: #9B9B9B; font-size: 12px; margin-top: 24px;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

module.exports = { generateOTP, sendOTPEmail }
