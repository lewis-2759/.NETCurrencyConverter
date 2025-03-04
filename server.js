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

// db
mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet()); 


app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; connect-src 'self' http://data.fixer.io");
    next();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// static files
app.use(express.static(path.join(__dirname, 'wwwroot')));

// db schema
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
        res.status(500).json({ message: 'An error occurred while saving your feedback. Please try again later.' });
    }
});

app.get('/api/key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'wwwroot', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});