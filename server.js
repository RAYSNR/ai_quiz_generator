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

// Serve the quiz input page
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

// API to create a quiz (mocked for now)
app.post('/api/createQuiz', (req, res) => {
    const { videoUrl } = req.body;
    if (!videoUrl) {
        return res.status(400).json({ error: "Video URL is required" });
    }
    console.log("Generating quiz for:", videoUrl);
    
    // Mock quiz data (replace this with AI-generated content)
    const quiz = [
        { question: "What is the main topic of the video?", options: ["AI", "Quantum Computing", "Blockchain", "Space Travel"], answer: "AI" },
        { question: "Who is the presenter?", options: ["Elon Musk", "Mark Zuckerberg", "Sundar Pichai", "Satya Nadella"], answer: "Sundar Pichai" },
        { question: "Which technology is mentioned first?", options: ["AI", "Quantum Computing", "Blockchain", "5G"], answer: "AI" },
        { question: "What year was this AI model released?", options: ["2023", "2024", "2025", "2026"], answer: "2024" },
        { question: "What problem does this AI solve?", options: ["Healthcare", "Automation", "Education", "All of the above"], answer: "All of the above" },
        { question: "Who benefits the most from this AI?", options: ["Students", "Businesses", "Researchers", "Everyone"], answer: "Everyone" },
        { question: "What is the AI's main limitation?", options: ["Speed", "Cost", "Ethics", "Data Availability"], answer: "Ethics" },
        { question: "Which company is competing with this AI?", options: ["Meta", "Apple", "IBM", "All of the above"], answer: "All of the above" },
        { question: "What is the future of this AI?", options: ["Better Performance", "Wider Adoption", "Regulation", "All of the above"], answer: "All of the above" }
    ];

    res.json({ message: "Quiz generated successfully", quiz });
});

// API to handle quiz submission
app.post('/api/submitQuiz', (req, res) => {
    const { email, answers } = req.body;
    if (!email || !answers) {
        return res.status(400).json({ error: "Email and answers are required" });
    }
    
    console.log(`Received quiz submission from ${email}`);
    console.log("Answers:", answers);

    // Store results (for now, just logging)
    const result = {
        email,
        answers,
        timestamp: new Date().toISOString()
    };

    fs.appendFile('quiz_results.json', JSON.stringify(result) + '\n', (err) => {
        if (err) {
            console.error("Error saving quiz results:", err);
            return res.status(500).json({ error: "Failed to save quiz results" });
        }
        res.json({ message: "Quiz submitted successfully!", result });
    });
});

// Set dynamic port (Railway auto-assigns)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'Not Set'}`);
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














