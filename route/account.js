const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const verifyToken = require('../controller/accountController.js').verifyToken

const router = express.Router();

router.post('/updateProfile', verifyToken, async (req, res) => {
    console.log("\n\n\n\n\n\n\n\n\nreq recieved");
    // res.status(401).json({message: "test"})
    try {
        console.log("Incoming user: ", req.user);
        const userId = req.user.id;
        console.log("Req body: ", req.body);
        const {username, email} = req.body;

        if(!username || !email) {
            console.log("No username or email");
            return res.status(400).json({message: "Missing Fields"});
        }

        const query = `Update users SET username = ?, email = ? WHERE id = ?`
        console.log(query)
        console.log();
        console.log("Starting db query");
        db.getConnection((err) => {
            console.log("DB CONNECT ERROR:", err);
        });
        console.log("DB CONNECT SUCCESS");

        try {
            console.log("Entering db query");
            const [result] = await db.query(query, [username, email, userId]);
            // console.log("Result: ", result);
            if(result.affectedRows === 0) {
                return res.status(404).json({message: "User not found"});
            }
            console.log(result)
            return res.status(200).json({
                message: "User Updated Successfully",
                updated: { username, email }
            })
        } catch (err) {
            console.error(err);
            const msg = err.sqlMessage; 
            const match = msg.match(/for key '(.+?)'/);
            if(err.errno === 1062) {
                const duplicateKey = match[1].split()[1]
                return res.status(500).json({ message: `${duplicateKey} already exists` });
                
            }
            return res.status(500).json({ message: "Database error" });
        }
    } catch (err) {
        console.log(err);
    }
})

router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    if(!username || !password)
        return res.status(400).json({message: "Username and Password required",});

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0)
            return res.status(400).json({message: "User already exists"});
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
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
        const token = jwt.sign(
            {id:user.id, username: user.username},
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1d'}
        );
        resUser = {username: user.username, email: user.email, id: user.id};
        console.log("Done")
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