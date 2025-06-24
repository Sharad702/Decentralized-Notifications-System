import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Using SendGrid's SMTP settings for reliability
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // For TLS
  auth: {
    user: 'apikey', // This is the literal string "apikey" for SendGrid
    pass: process.env.SENDGRID_API_KEY, // Your SendGrid API key
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: to,
      subject: subject,
      text: text,
      html: `<p>${text}</p>`,
    });

    console.log('Message sent via SendGrid: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    throw error;
  }
}; 