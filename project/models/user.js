const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

// Check if the model is already defined to prevent overwrite error
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
