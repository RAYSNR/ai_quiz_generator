require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Health check endpoint (for debugging)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve the quiz input page as the default homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz_input.html'));
});

// API route for handling transcript processing
app.post('/api/transcript', (req, res) => {
    const { transcript } = req.body;
    if (!transcript) {
        return res.status(400).json({ error: "Transcript is required" });
    }
    console.log("Received Transcript:", transcript);
    res.json({ message: "Transcript received successfully", transcript });
});

// API route for generating quiz
app.post('/api/createQuiz', (req, res) => {
    const { videoUrl } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ error: "Video URL is required" });
    }

    console.log(`Generating quiz for: ${videoUrl}`);

    // Simulating quiz generation based on video URL
    const quiz = [
        { question: "What is the main topic of the video?", options: ["AI", "Quantum Computing", "Blockchain", "Space Travel"], answer: "AI" },
        { question: "Who is the presenter?", options: ["Elon Musk", "Mark Zuckerberg", "Sundar Pichai", "Satya Nadella"], answer: "Sundar Pichai" }
    ];

    res.json({ message: "Quiz generated successfully", quiz });
});

// API route for quiz submission
app.post('/api/submitQuiz', (req, res) => {
    const { email, responses } = req.body;

    if (!email || !responses) {
        return res.status(400).json({ error: "Email and responses are required" });
    }

    console.log(`Quiz submitted by: ${email}`);
    console.log("User Responses:", responses);

    // Simulate storing quiz results in a file
    const quizData = { email, responses, timestamp: new Date().toISOString() };
    fs.appendFileSync('quiz_results.json', JSON.stringify(quizData) + "\n");

    res.json({ message: "Quiz submitted successfully. Check your email for results." });
});

// Set dynamic port (Railway will assign automatically)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'Not Set'}`);
    console.log(`📂 Working Directory: ${process.cwd()}`);
});

// Global error handling (captures silent failures)
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.stack);
    res.status(500).send('Internal Server Error');
});

// Handle unhandled rejections (catches async failures)
process.on('unhandledRejection', (reason, promise) => {
    console.error("⚠️ Unhandled Rejection:", promise, "Reason:", reason);
});











