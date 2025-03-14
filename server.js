require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

// Simulated quiz generation API
app.post('/api/createQuiz', (req, res) => {
    const { videoUrl } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ error: "Video URL is required" });
    }

    console.log("Received YouTube URL:", videoUrl);

    // Simulated quiz response
    const quiz = [
        { 
            question: "What is the main topic of the video?",
            options: ["AI", "Quantum Computing", "Blockchain", "Space Travel"],
            answer: "AI"
        },
        { 
            question: "Who is the presenter?",
            options: ["Elon Musk", "Mark Zuckerberg", "Sundar Pichai", "Satya Nadella"],
            answer: "Sundar Pichai"
        }
    ];

    res.json({ message: "Quiz generated successfully", quiz });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});










