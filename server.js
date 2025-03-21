// server.js - Fixed AI JSON Response Issue
require('dotenv').config();
console.log("DEBUG: Environment Variables:", process.env);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { OpenAI } = require("openai");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// OpenAI setup
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Test OpenAI API
async function testOpenAI() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: "Say hello!" }],
        });
        console.log("OpenAI Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("Error calling OpenAI:", error);
    }
}
testOpenAI();

// Serve quiz input page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz_input.html'));
});

// Generate AI quiz questions
app.post('/api/generateQuiz', async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) {
        return res.status(400).json({ error: "Transcript is required to generate quiz." });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Create exactly 10 multiple-choice questions from the transcript. Each question must have 4 answer choices with one correct answer. Respond ONLY with valid JSON, no markdown formatting, no extra text." },
                { role: "user", content: `Transcript: ${transcript}` }
            ],
            temperature: 0.7
        });

        let aiResponse = response.choices[0].message.content.trim();
        if (aiResponse.startsWith("```json")) {
            aiResponse = aiResponse.slice(7, -3).trim(); // Remove Markdown formatting
        }

        let quizQuestions = JSON.parse(aiResponse);
        res.json(quizQuestions);
    } catch (error) {
        console.error("Error generating quiz:", error);
        res.status(500).json({ error: "Failed to generate quiz." });
    }
});

// Create a new quiz file
app.post('/api/createQuiz', async (req, res) => {
    let { videoUrl, videoDescription, transcript, quizFilename } = req.body;

    if (!videoUrl || !videoDescription || !transcript || !quizFilename) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (videoUrl.includes("youtube.com/watch?v=")) {
        let videoId = videoUrl.split("v=")[1].split("&")[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    try {
        let quizRes = await fetch(`http://localhost:${PORT}/api/generateQuiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript })
        });

        let quizData = await quizRes.json();
        if (!Array.isArray(quizData) || quizData.length !== 10) {
            throw new Error("Invalid quiz format from AI.");
        }

        const templatePath = path.join(__dirname, 'public', 'quizmaster.html');
        const newQuizPath = path.join(__dirname, 'public', 'quiz', quizFilename);  // ✅ Save quizzes inside /public/quiz/

        fs.readFile(templatePath, 'utf8', (err, data) => {
            if (err) return res.status(500).json({ error: "Failed to read template file" });

            let updatedQuiz = data
                .replace('{{VIDEO_DESCRIPTION}}', videoDescription)
                .replace('{{VIDEO_URL}}', videoUrl)
                .replace('{{TRANSCRIPT}}', transcript)
                .replace('let quizData = [];', `let quizData = ${JSON.stringify(quizData)};`);

            fs.writeFile(newQuizPath, updatedQuiz, (err) => {
                if (err) return res.status(500).json({ error: "Failed to create quiz file" });
                res.json({ success: true, quizUrl: `https://srv748242.hstgr.cloud/public/quiz/${quizFilename}` });  // ✅ Fix URL
            });
        });

    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ error: "Quiz generation failed." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://192.168.1.6:${PORT}`);
});


















