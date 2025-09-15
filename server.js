// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // if using Node 18+, built-in fetch is OK

const app = express();

// Allow only your frontend
app.use(cors({
  origin: "https://shashank-2004.github.io"
}));
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// POST /submit route
app.post("/submit", async (req, res) => {
  const { name, mobile, age, email } = req.body;
  console.log("📩 Form data received:", req.body);

  if (!name || !mobile || !age || !email) {
    return res.json({ success: false, message: "All fields are required" });
  }

  // Brevo API call
  try {
    const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY, // Set this in Render environment variables
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Consultation Form", email: process.env.BREVO_SENDER },
        to: [{ email: process.env.BREVO_RECEIVER }], // who receives the email
        subject: "New Consultation Request",
        htmlContent: `
          <h2>New Consultation Request</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
            <tr><th align="left">Name</th><td>${name}</td></tr>
            <tr><th align="left">Mobile</th><td>${mobile}</td></tr>
            <tr><th align="left">Age</th><td>${age}</td></tr>
            <tr><th align="left">Email</th><td>${email}</td></tr>
          </table>
        `
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Email sent:", result);
      return res.json({ success: true, message: "Email sent successfully!" });
    } else {
      console.error("❌ Brevo API error:", result);
      return res.json({ success: false, message: "Failed to send email", error: result });
    }

  } catch (err) {
    console.error("❌ API request error:", err);
    return res.json({ success: false, message: "Failed to send email", error: err.message });
  }
});

// Dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
