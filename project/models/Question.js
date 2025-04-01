// models/Question.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    answer: String,
    answeredBy: String,
    likes: { type: Number, default: 0 },
    likedBy: [String]
});

const questionSchema = new mongoose.Schema({
    username: String,
    Question: { type: String, required: true },
    image: String,
    imageDescription: String,
    answers: [answerSchema]
});

// Create an index on the Question field for faster searches
questionSchema.index({ Question: 'text' });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
