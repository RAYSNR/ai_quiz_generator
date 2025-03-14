const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static("public"));

// Placeholder for quiz data storage
let quizResults = [];

// API to receive quiz submission
app.post("/api/submitQuiz", (req, res) => {
    const { email, responses } = req.body;

    if (!email || !responses) {
        return res.status(400).json({ error: "Missing email or responses" });
    }

    // Store the quiz results (this should be replaced with a database)
    quizResults.push({ email, responses });

    // Send confirmation email
    sendMail(email, responses);

    res.json({ message: "Quiz submitted! Check your email for results." });
});

// Email function using Nodemailer
function sendMail(email, responses) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "your-email@gmail.com", // Replace with your email
            pass: "your-email-password" // Replace with your password or App Password
        }
    });

    const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Your Quiz Results",
        text: `Here are your responses: ${JSON.stringify(responses, null, 2)}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Email send error:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});















