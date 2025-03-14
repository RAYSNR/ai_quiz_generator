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








