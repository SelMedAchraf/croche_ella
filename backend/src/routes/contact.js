import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields (name, email, message) are required' });
    }

    // Check if email configuration is present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('CRITICAL ERROR: EMAIL_USER or EMAIL_PASS environment variables are not set in the backend .env file.');
      return res.status(500).json({ error: 'Server configuration error. Contact administrator.' });
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Setup email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'crocheella19@gmail.com', // The destination email
      subject: 'New message from website contact form',
      text: `Name: ${name}\n\nEmail: ${email}\n\nMessage:\n${message}\n\nDate: ${new Date().toLocaleString()}`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

export default router;
