// index.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const User = require('./models/user');
const Question = require('./models/Question');
const authRoutes = require('./routes/authRoutes');
const port = 3000;

const app = express();

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }
}).single('questionImage');

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/auth', authRoutes);

function isAuthenticated(req, res, next) {
    if (req.session.username) {
        return next();
    } else {
        res.redirect('/');
    }
}

mongoose.connect('mongodb://localhost:27017/your_database_name')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const username = req.session.username;
        const questions = await Question.find({ username });
        res.render('profile', { username, questions });
    } catch (error) {
        res.status(500).send('Error fetching profile data: ' + error.message);
    }
});

app.post('/post', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.render('home', { msg: err });
        } else {
            try {
                const newQuestion = new Question({
                    username: req.session.username,
                    Question: req.body.askquestion || '', // Make question optional
                    image: req.file ? `/uploads/${req.file.filename}` : '',
                    imageDescription: req.body.imageDescription || '' // Default to empty string if no description provided
                });
                await newQuestion.save();
                res.redirect('/home');
            } catch (err) {
                res.render('home', { msg: 'Error: Question could not be saved!' });
            }
        }
    });
});

app.post('/answer', async (req, res) => {
    const { questionId, answer } = req.body;
    try {
        const question = await Question.findById(questionId);
        const newAnswer = {
            answer: answer,
            answeredBy: req.session.username
        };
        question.answers.push(newAnswer);
        await question.save();
        res.redirect('/home');
    } catch (err) {
        res.status(500).send('Error saving answer: ' + err.message);
    }
});

app.post('/edit-answer-inline', async (req, res) => {
    const { questionId, answerId, newAnswer } = req.body;
    try {
        const question = await Question.findById(questionId);
        const answer = question.answers.id(answerId);
        if (answer.answeredBy === req.session.username) {
            answer.answer = newAnswer;
            await question.save();
            res.redirect('/home');
        } else {
            res.status(403).send('You are not authorized to edit this answer');
        }
    } catch (err) {
        res.status(500).send('Error editing answer: ' + err.message);
    }
});

app.post('/like', isAuthenticated, async (req, res) => {
    const { questionId, answerId } = req.body;
    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).send('Question not found');
        }

        const answer = question.answers.id(answerId);
        if (!answer) {
            return res.status(404).send('Answer not found');
        }

        if (answer.likedBy.includes(req.session.username)) {
            return res.status(400).send('You have already liked this answer');
        }

        answer.likes += 1;
        answer.likedBy.push(req.session.username);
        await question.save();

        res.redirect('/home');
    } catch (err) {
        res.status(500).send('Error liking the answer: ' + err.message);
    }
});

app.get('/search', isAuthenticated, async (req, res) => {
    try {
        const query = req.query.search;
        const questions = await Question.find({
            Question: new RegExp(query, 'i')
        });
        res.render('home', { questions, session: req.session });
    } catch (err) {
        res.status(500).send('Error fetching search results: ' + err.message);
    }
});

app.get('/home', isAuthenticated, async (req, res) => {
    try {
        const questions = await Question.find({});
        res.render('home', { questions, session: req.session });
    } catch (err) {
        res.status(500).send('Error fetching questions: ' + err.message);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
