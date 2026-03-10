import express from 'express';
import nodemailer from 'nodemailer';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

let currentOtp = null;
let otpExpires = null;

router.post('/send-code', authenticateAdmin, async (req, res) => {
  try {
    const { email } = req.user;

    // Check if email configuration is present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Server email configuration error.' });
    }

    // Generate 6-digit code
    currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email || 'crocheella19@gmail.com',
      subject: 'Your Admin Password Reset Code',
      text: `Hello,\n\nYou requested to change your admin password.\nHere is your 6-digit security code: ${currentOtp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this change, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Code sent successfully' });
  } catch (error) {
    console.error('Error sending OTP code:', error);
    res.status(500).json({ error: 'Failed to send security code.' });
  }
});

router.post('/verify-code', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    if (!currentOtp || !otpExpires) {
      return res.status(400).json({ error: 'No code was requested or code has expired.' });
    }

    if (Date.now() > otpExpires) {
      currentOtp = null;
      otpExpires = null;
      return res.status(400).json({ error: 'The security code has expired. Please request a new one.' });
    }

    if (code !== currentOtp) {
      return res.status(400).json({ error: 'Invalid security code.' });
    }

    // Successful Verification
    // Clear the OTP so it can only be used once
    currentOtp = null;
    otpExpires = null;

    res.status(200).json({ success: true, message: 'Code verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP code:', error);
    res.status(500).json({ error: 'Failed to verify security code.' });
  }
});

export default router;
