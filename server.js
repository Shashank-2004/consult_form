// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // make sure node-fetch is installed

const app = express();
app.use(cors());
app.use(bodyParser.json());

// POST route for form submission
app.post("/submit", async (req, res) => {
  const { name, mobile, age, email } = req.body;

  if (!name || !mobile || !age || !email) {
    return res.json({ success: false, message: "All fields are required" });
  }

  console.log("📩 Form data received:", req.body);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY, // ✅ API key from Render
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Consultation Form", email: process.env.BREVO_SENDER },
        to: [{ email: process.env.BREVO_RECEIVER }],
        replyTo: { email: email },
        subject: `New Consultation Request from ${name} (${mobile})`,  // ✅ unique subject
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

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Email sent successfully:", data);
      res.json({ success: true, message: "Email sent successfully!" });
    } else {
      console.error("❌ Brevo API error:", data);
      res.json({ success: false, message: "Failed to send email" });
    }
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.json({ success: false, message: "Error sending email" });
  }
});

// Use Render’s provided port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
