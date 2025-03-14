require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("API Key Loaded:", OPENAI_API_KEY ? "Success" : "Failed");

const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Ensure Railway can set its own port

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the quiz input page as the default homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz_input.html'));
});

// Base API route listing available endpoints
app.get('/api', (req, res) => {
    res.json({
        message: "Welcome to the AI Quiz API",
        endpoints: {
            quiz: "/api/quiz",
            submit: "/api/submit",
            transcript: "/api/transcript",
            chat: "/api/chat",
            createQuiz: "/api/createQuiz"
        }
    });
});

// Fetch AI-generated quiz questions
let quizData = [];

app.get('/api/quiz', async (req, res) => {
    if (quizData.length === 0) {
        return res.status(400).json({ error: "No quiz data available. Create a new quiz first." });
    }
    res.json(quizData);
});

// Handle quiz submission
app.post('/api/submit', (req, res) => {
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid answers format" });
    }

    let score = answers.reduce((acc, ans, i) => acc + (ans === quizData[i].correct ? 1 : 0), 0);
    res.json({ score, total: quizData.length });
});

// Create a new quiz file from quizmaster.html
app.post('/api/createQuiz', async (req, res) => {
    let videoUrl = req.body.videoUrl;
    const { transcript, quizFilename } = req.body;

    if (!videoUrl || !transcript || !quizFilename) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (videoUrl.includes("youtube.com/watch?v=")) {
        let videoId = videoUrl.split("v=")[1].split("&")[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    try {
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Generate a 10-question multiple-choice quiz based on the following transcript. Format the response as pure JSON (no explanations)." },
                { role: "user", content: transcript }
            ]
        });

        const aiText = aiResponse.choices[0].message.content.trim();
        const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/);
        const cleanJson = jsonMatch ? jsonMatch[1] : aiText;

        quizData = JSON.parse(cleanJson);
        console.log("Parsed Questions:", quizData);
    } catch (error) {
        console.error("OpenAI Error:", error);
        return res.status(500).json({ error: "Failed to generate quiz questions." });
    }

    let quizHTML = quizData.map((q, index) => `
        <div class='question' id='q${index}' style='display: ${index === 0 ? "block" : "none"};'">
            <p><strong>Q${index + 1}:</strong> ${q.question}</p>
            <div class='options'>
                ${q.options.map((opt, i) => `
                    <label>
                        <input type='radio' name='q${index}' value='${i}'>
                        ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    const templatePath = path.join(__dirname, 'public', 'quizmaster.html');
    const newQuizPath = path.join(__dirname, 'public', `${quizFilename}.html`);

    fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading template:", err);
            return res.status(500).json({ error: "Failed to read template file" });
        }

        if (!quizHTML.trim()) {
            console.error("Error: No quiz questions generated.");
            return res.status(500).json({ error: "No quiz questions generated." });
        }

        let updatedQuiz = data
            .replace('{{VIDEO_URL}}', videoUrl)
            .replace('{{QUESTIONS}}', quizHTML);

        fs.writeFile(newQuizPath, updatedQuiz, (err) => {
            if (err) {
                console.error("File Write Error:", err);
                return res.status(500).json({ error: "Failed to create quiz file" });
            }
            console.log(`Quiz file created successfully: ${newQuizPath}`);
            res.json({ success: true, quizUrl: `/${quizFilename}.html` });
        });
    });
});

// Handle transcript processing
app.post('/api/transcript', (req, res) => {
    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ error: "Transcript is required" });
    }

    console.log("Received Transcript:", transcript);
    res.json({ message: "Transcript received successfully", transcript });
});

// Ensure the server is accessible on Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});







