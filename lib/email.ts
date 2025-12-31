import nodemailer from 'nodemailer';

// Create transporter - works with Gmail, SendGrid, or any SMTP service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateVerificationEmailHtml(verificationUrl: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
          }
          .content {
            padding: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Thank you for registering with Mini Bank! Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><small>${verificationUrl}</small></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Mini Bank. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateWelcomeEmailHtml(userName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to Mini Bank</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #28a745;
          }
          .content {
            padding: 20px 0;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Mini Bank!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your email has been verified and your account is now active!</p>
            <p>You can now:</p>
            <ul>
              <li>Access your account dashboard</li>
              <li>Create and manage multiple accounts</li>
              <li>View and make transactions</li>
              <li>Monitor your account balance</li>
            </ul>
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Mini Bank. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
