const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3000;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/questions', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.once('open', () => {
    console.log("mongodb connection successful");
});

// Define the schema for questions
const userSchema = new mongoose.Schema({
    Question: String,
    answer: String // Adding a field to store the answer
});

const Users = mongoose.model("data", userSchema);

// Handle POST request to /post for submitting questions
app.post('/post', async (req, res) => {
    const { Question } = req.body;
    const user = new Users({
        Question
    });
    await user.save();
    console.log("Question saved:", user); // Log the saved question
    res.redirect('/');
});

// Handle POST request to /answer for submitting answers
app.post('/answer', async (req, res) => {
    const { questionId, answer } = req.body;
    try {
        // Find the question by ID and update it with the answer
        const question = await Users.findById(questionId);
        question.answer = answer; // Update the answer field
        await question.save();
        console.log("Answer saved:", question); // Log the saved question to check if answer is saved
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Handle GET request to / for rendering the home page
app.get('/', async (req, res) => {
    try {
        // Retrieve all questions along with their answers
        const questions = await Users.find({});
        console.log("Questions with Answers:", questions); // Log retrieved questions to check if answers are fetched
        res.render('home', { questions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log("Server started");
});