const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await newUser.save();
        req.session.username = newUser.username; // Store username in session
        res.redirect('/home'); // Redirect to home page after successful signup
    } catch (error) {
        res.status(500).send('Signup error: ' + error.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({message :"User not found"});
        }
        
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            console.log('Invalid password');
            return res.status(401).json({message : 'Invalid Username or Password'});
        }
        
        req.session.username = user.username;
        console.log('User logged in:', req.session.username);
        res.redirect('/home');
    } catch (error) {
        console.log('Login error:', error.message);
        res.status(500).send('Login error: ' + error.message);
    }
});



router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout error: ' + err.message);
        }
        res.redirect('/');
    });
});

module.exports = router;
