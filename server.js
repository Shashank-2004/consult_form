const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const SibApiV3Sdk = require("@getbrevo/brevo");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// ✅ Brevo API Setup
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY   // Add this in Render Environment
);

// ✅ Form submission route
app.post("/submit", async (req, res) => {
  const { name, mobile, age, email } = req.body;

  if (!name || !mobile || !age || !email) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "Consultation Form", email: process.env.BREVO_SENDER };
  sendSmtpEmail.to = [{ email: process.env.BREVO_RECEIVER }];
  sendSmtpEmail.replyTo = { email: email };
  sendSmtpEmail.subject = "New Consultation Request";
  sendSmtpEmail.htmlContent = `
    <h2>New Consultation Request</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
      <tr><th align="left">Name</th><td>${name}</td></tr>
      <tr><th align="left">Mobile</th><td>${mobile}</td></tr>
      <tr><th align="left">Age</th><td>${age}</td></tr>
      <tr><th align="left">Email</th><td>${email}</td></tr>
    </table>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to send email" });
  }
});

// Dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});