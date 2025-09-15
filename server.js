const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // Make sure it's installed: npm install node-fetch@2

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/send", async (req, res) => {
  const { name, mobile, age, email } = req.body;

  console.log("📩 Form data received:", req.body);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY, // Your Brevo API key
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Consultation Form", email: process.env.BREVO_SENDER },
        to: [{ email: process.env.BREVO_RECEIVER }],
        subject: "New Consultation Request",
        textContent: `📩 New Consultation Request\n\nName: ${name}\nMobile: ${mobile}\nAge: ${age}\nEmail: ${email}\n`,
        htmlContent: `
          <h2>📩 New Consultation Request</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Mobile:</b> ${mobile}</p>
          <p><b>Age:</b> ${age}</p>
          <p><b>Email:</b> ${email}</p>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API error:", data);
      return res.status(500).json({ error: "Failed to send email", details: data });
    }

    console.log("✅ Email sent successfully:", data);
    res.status(200).json({ message: "Email sent successfully", data });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
