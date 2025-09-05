const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


// Email templates
const emailTemplates = {
  verification: (name, token) => ({
    subject: 'Verify Your JobPulse Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 20px;">
        <div style="background-color: #ff6b35; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff;">JobPulse</h1>
        </div>
        <div style="padding: 20px; background-color: #2a2a2a;">
          <h2 style="color: #ff6b35;">Welcome to JobPulse!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with JobPulse. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/auth/verify?token=${token}" 
               style="background-color: #ff6b35; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #ff6b35;">
            ${process.env.FRONTEND_URL}/auth/verify?token=${token}
          </p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The JobPulse Team</p>
        </div>
      </div>
    `
  }),

  applicationReceived: (jobTitle, companyName) => ({
    subject: `Application Received - ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 20px;">
        <div style="background-color: #ff6b35; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff;">JobPulse</h1>
        </div>
        <div style="padding: 20px; background-color: #2a2a2a;">
          <h2 style="color: #ff6b35;">Application Received!</h2>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
          <p>We'll notify you when the employer reviews your application.</p>
          <p>You can track your application status in your dashboard.</p>
          <p>Best regards,<br>The JobPulse Team</p>
        </div>
      </div>
    `
  }),

  newApplication: (jobTitle, companyName, applicantName) => ({
    subject: `New Application - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 20px;">
        <div style="background-color: #ff6b35; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff;">JobPulse</h1>
        </div>
        <div style="padding: 20px; background-color: #2a2a2a;">
          <h2 style="color: #ff6b35;">New Application Received!</h2>
          <p>You have received a new application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
          <p><strong>Applicant:</strong> ${applicantName}</p>
          <p>Please log in to your dashboard to review this application.</p>
          <p>Best regards,<br>The JobPulse Team</p>
        </div>
      </div>
    `
  }),

  passwordReset: (name, token) => ({
    subject: 'Reset Your JobPulse Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 20px;">
        <div style="background-color: #ff6b35; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff;">JobPulse</h1>
        </div>
        <div style="padding: 20px; background-color: #2a2a2a;">
          <h2 style="color: #ff6b35;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/auth/reset?token=${token}" 
               style="background-color: #ff6b35; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The JobPulse Team</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const emailContent = emailTemplates[template](...data);
    
    const mailOptions = {
      from: `"JobPulse" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
}; 