const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({
  origin: "https://shashank-2004.github.io",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// Nodemailer setup using Brevo's SMTP
let transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Use 'false' for STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY
  }
});

function sendConsultationEmail(data, res) {
  const { name, mobile, age, email } = data;

  if (!name || !mobile || !age || !email) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const mailOptions = {
    // ⚠️ IMPORTANT: Replace 'your@verified-domain.com' with an email from your verified domain
    from: `"Consultation Form" <your@verified-domain.com>`, 
    // This is where you will receive the form data. Use your personal email.
    to: "you@example.com", 
    replyTo: email,
    subject: "New Consultation Request",
    html: `
      <h2>New Consultation Request</h2>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
        <tr><th align="left">Name</th><td>${name}</td></tr>
        <tr><th align="left">Mobile</th><td>${mobile}</td></tr>
        <tr><th align="left">Age</th><td>${age}</td></tr>
        <tr><th align="left">Email</th><td>${email}</td></tr>
      </table>
    `
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("❌ Email error:", error);
      return res.json({ success: false, message: "Email error: " + error.message });
    }
    res.json({ success: true, message: "Email sent successfully!" });
  });
}

// Main form submission route
app.post("/submit", (req, res) => {
  sendConsultationEmail(req.body, res);
});

// Also accept POST at root (optional)
app.post("/", (req, res) => {
  sendConsultationEmail(req.body, res);
});

// Dynamic port for deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});