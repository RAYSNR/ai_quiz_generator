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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve the quiz input page as the default homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz_input.html'));
});

// API route for generating quiz questions
app.post('/api/createQuiz', (req, res) => {
    const { videoUrl } = req.body;
    if (!videoUrl) {
        return res.status(400).json({ error: "Video URL is required" });
    }

    // Mocked quiz generation logic (Replace with AI API call if needed)
    const quiz = [
        { question: "What is the main topic of the video?", options: ["AI", "Quantum Computing", "Blockchain", "Space Travel"], answer: "AI" },
        { question: "Who is the presenter?", options: ["Elon Musk", "Mark Zuckerberg", "Sundar Pichai", "Satya Nadella"], answer: "Sundar Pichai" },
        { question: "What company developed this AI?", options: ["Google", "Microsoft", "OpenAI", "Amazon"], answer: "Google" },
        { question: "Which technology is mentioned first?", options: ["AI", "Quantum Computing", "Blockchain", "5G"], answer: "AI" },
        { question: "What year was this AI model released?", options: ["2023", "2024", "2025", "2026"], answer: "2024" },
        { question: "What problem does this AI solve?", options: ["Healthcare", "Automation", "Education", "All of the above"], answer: "All of the above" },
        { question: "Who benefits the most from this AI?", options: ["Students", "Businesses", "Researchers", "Everyone"], answer: "Everyone" },
        { question: "What is the AI’s main limitation?", options: ["Speed", "Cost", "Ethics", "Data Availability"], answer: "Ethics" },
        { question: "Which company is competing with this AI?", options: ["Meta", "Apple", "IBM", "All of the above"], answer: "All of the above" },
        { question: "What is the future of this AI?", options: ["Better Performance", "Wider Adoption", "Regulation", "All of the above"], answer: "All of the above" }
    ];

    console.log("Generated Quiz Data:", quiz);

    res.json({ message: "Quiz generated successfully", quiz });
});

// Set dynamic port (Railway will assign automatically)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'Not Set'}`);
    console.log(`📂 Working Directory: ${process.cwd()}`);
});

// Global error handling
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.stack);
    res.status(500).send('Internal Server Error');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error("⚠️ Unhandled Rejection:", promise, "Reason:", reason);
});












