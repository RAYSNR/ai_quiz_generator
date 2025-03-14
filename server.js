const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Endpoint to generate a quiz
app.post("/api/createQuiz", (req, res) => {
    const sampleQuiz = [
        { question: "What is the main topic of the video?", options: ["AI", "Quantum Computing", "Blockchain", "Space Travel"], answer: "AI" },
        { question: "Who is the presenter?", options: ["Elon Musk", "Mark Zuckerberg", "Sundar Pichai", "Satya Nadella"], answer: "Sundar Pichai" },
        { question: "Which technology is mentioned first?", options: ["AI", "Quantum Computing", "Blockchain", "5G"], answer: "AI" },
        { question: "What year was this AI model released?", options: ["2023", "2024", "2025", "2026"], answer: "2024" },
        { question: "What problem does this AI solve?", options: ["Healthcare", "Automation", "Education", "All of the above"], answer: "All of the above" },
        { question: "Who benefits the most from this AI?", options: ["Students", "Businesses", "Researchers", "Everyone"], answer: "Everyone" },
        { question: "What is the AI’s main limitation?", options: ["Speed", "Cost", "Ethics", "Data Availability"], answer: "Ethics" },
        { question: "Which company is competing with this AI?", options: ["Meta", "Apple", "IBM", "All of the above"], answer: "All of the above" },
        { question: "What is the future of this AI?", options: ["Better Performance", "Wider Adoption", "Regulation", "All of the above"], answer: "All of the above" },
        { question: "How accessible is this AI technology?", options: ["Limited Access", "Publicly Accessible", "Exclusive", "Subscription-Based"], answer: "Publicly Accessible" }
    ];
    res.json({ message: "Quiz generated successfully.", quiz: sampleQuiz });
});

// Endpoint to handle quiz submission
app.post("/api/submitQuiz", async (req, res) => {
    const { email, responses } = req.body;
    if (!email || !responses || responses.length === 0) {
        return res.status(400).json({ message: "Invalid submission. Email and responses required." });
    }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: `AI Hub Quiz <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your AI Hub Quiz Results",
        text: `Thank you for completing the quiz! Here are your responses:\n\n${JSON.stringify(responses, null, 2)}\n\nWe will analyze your results and get back to you soon!`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Quiz submitted! Check your email for results." });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

















