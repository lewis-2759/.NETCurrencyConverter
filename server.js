require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet()); // Secure HTTP headers

// Content Security Policy
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; connect-src 'self' http://data.fixer.io");
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from the "wwwroot" directory
app.use(express.static(path.join(__dirname, 'wwwroot')));

// Define a schema and model for feedback
const feedbackSchema = new mongoose.Schema({
    name: String,
    feedback: String
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// API endpoint to handle feedback submission
app.post('/api/feedback', [
    body('name').trim().isLength({ min: 1 }).escape(),
    body('feedback').trim().isLength({ min: 1 }).escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, feedback } = req.body;
    const newFeedback = new Feedback({ name, feedback });

    try {
        await newFeedback.save();
        res.status(200).send('Feedback received');
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).send('Error saving feedback');
    }
});

// Endpoint to serve the API key
app.get('/api/key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'wwwroot', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});