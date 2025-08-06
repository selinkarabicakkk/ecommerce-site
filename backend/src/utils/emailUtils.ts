import nodemailer from 'nodemailer';
import config from '../config/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email
 * @param options Email options (to, subject, html)
 * @returns Promise that resolves when email is sent
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  // Define email options
  const mailOptions = {
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

/**
 * Generate a verification email
 * @param email User email
 * @param token Verification token
 * @returns HTML email content
 */
export const generateVerificationEmail = (email: string, token: string): string => {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}&email=${email}`;
  
  return `
    <h1>Email Verification</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
};

/**
 * Generate a password reset email
 * @param email User email
 * @param token Reset token
 * @returns HTML email content
 */
export const generatePasswordResetEmail = (email: string, token: string): string => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}&email=${email}`;
  
  return `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
}; 