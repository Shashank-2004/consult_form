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

// Serve static files from public
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Nodemailer setup
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: "disasterdock@gmail.com", // your Gmail address from Render env
    pass: "uome rmju grbn yutx"  // your Gmail App Password from Render env
  }
});


// Form submission route
app.post("/submit", (req, res) => {
  const { name, mobile, age, email } = req.body;

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
      console.error(error);
      return res.json({ success: false, message: "Failed to send email" });
    }
    res.json({ success: true, message: "Email sent successfully!" });
  });
});

// Dynamic port for deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});