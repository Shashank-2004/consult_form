// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer transporter setup
// Use environment variables for security.
// For Gmail, use an App Password if 2-Step Verification is on.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address from .env
        pass: process.env.GMAIL_PASS  // Your App Password from .env
    }
});

// Route to handle form submissions
app.post('/submit', async (req, res) => {
    const { name, mobile, age, email } = req.body;

    // Basic validation
    if (!name || !mobile || !age || !email) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.GMAIL_USER, // The email address to receive the submission
        subject: `New Consultation Request from ${name}`,
        html: `
            <h3>New Consultation Request</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
            <p><strong>Age:</strong> ${age}</p>
            <p><strong>Email:</strong> ${email}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Form submitted successfully!' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});