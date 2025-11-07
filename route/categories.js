const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
    res.send("categories");
})

router.get('/read-all', async (req, res) => {
    try {
        const rows = await db.query("SELECT * FROM categories")
        console.log(rows[0]);
        res.json({categories: rows[0]})
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"})
    }
})

module.exports = router