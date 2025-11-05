const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const verifyToken = require('../controller/accountController.js').verifyToken

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    if(!username || !password)
        return res.status(400).json({message: "Username and Password required",});

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0)
            return res.status(400).json({message: "User already exists"});
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password, email) VALUES (?, ?)', [username, hashedPassword, email]);
        res.json({message: "Account created successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error. Account creation failed."});
    }
})

router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password)
        return res.status(400).json({message: "username and password required"});

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if(rows.length === 0)
            return res.status(400).json({message: "Invalid username or password"});
        
        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if(!valid)
            return res.status(400).json({message: "Invalid username or password"});
        const token = jwt.sign({id:user.id, username: user.username}, process.env.JWT_SECRET_KEY);
        resUser = {username: user.username, email: user.email};
        res.json({message: "Login Successful", token, user: resUser});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Server Error. Cannot login"});
    }

})

router.get('/profile', verifyToken, async (req, res) => {
    res.json({ message: `Welcome ${req.user.username}`, user: req.user });
});

router.use('/', (req, res) => {
    res.json({
        message: "account",
    })
})



module.exports = router;