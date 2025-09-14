const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

// Allow requests from your GitHub Pages site
app.use(cors({
  origin: "https://shashank-2004.github.io",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// Serve static files from public (if any)
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Default route (just shows your frontend if needed)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Nodemailer setup (✅ uses Render env vars for safety)
let transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587, // or 465 if you want SSL
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.BREVO_USER,  // your Brevo email
    pass: process.env.BREVO_PASS   // your Brevo API key
  }
});


// Email sending function
function sendConsultationEmail(data, res) {
  const { name, mobile, age, email } = data;

  if (!name || !mobile || !age || !email) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const mailOptions = {
    from: `"Consultation Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
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