const express = require("express");
const db = require("../db.js");
const { parse } = require("dotenv");

// const verifyToken = require('../controller/accountController.js').verifyToken;

const router = express.Router();

router.post('/createExpense', async (req, res) => {
    // const {username} = req.body;
    const {username, id} = req.user;
    const expense = {...req.body.expense, username, id};
    // expense = {...expense,username , id};

    if(!username)
        return res.status(401).json({message: "User not found"});
    try {
        // console.log(req.user);
        await db.query("INSERT INTO expenses (users_id, category_id, amount, description, date) VALUES (?,?,?,?,?)",
            [expense.id, expense.category_id, expense.amount, expense.description, expense.date]
        );
        res.json({message: "expense created", expense});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal Server Error. Cannot create expense"});
    }
})

router.post("/deleteExpense", async (req, res) => {
    // console.log(req.body.expense);
    const {delete_all, expense_id, cat_id} = req.body;
    const user_id = req.user.id;
    console.log(delete_all, expense_id, user_id, cat_id);


    if(delete_all === 1) {
        try {
            await db.query("DELETE FROM expenses WHERE users_id = ?", [user_id]);
            res.json({message: "expenses deleted"});
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Internal Server Error. Cannot delete expense."});
        }
    } else if (delete_all == 2 && cat_id) {
        try {
            await db.query("DELETE FROM expenses WHERE users_id = ? AND category_id = ?", [user_id, cat_id]);
            res.json({message: "expenses deleted"});
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Internal Server Error. Cannot delete expense."});
        }
    } else {
        try {
            await db.query("DELETE FROM expenses WHERE id = ?", [expense_id]);
            res.json({message: "expense deleted"});
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Internal Server Error. Cannot delete expense."});
        }
    }

})


router.get('/viewExpenses/', async (req, res) => {
    const {id} = req.user;
    const {category_id, filter, start_date, end_date} = req.body;


    try {
        let expenses;
        let totalAmount;

        let query = `SELECT * FROM expenses WHERE users_id = ?`;
        let params = [id]

        if(category_id) {
            query += ` AND category_id = ?`;
            params.push(category_id);
        }

        if (filter) {
            switch(filter) {
                case "week":
                    query += " AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
                    break;
                case "month":
                    query += " AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
                    break;
                case "3months":
                    query += " AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
                    break;
                case "custom":
                    if (start_date && end_date) {
                        query += "AND date BETWEEN ? AND ?";
                        params.push(start_date, end_date);
                    } else {
                        return res.status(400).json({message: "Custom filter requires start date and end date"});
                    }
                    break;
                default:
                    return res.status(400).json({message: "Invalid filter option"});
            }
        }

        const [expenseRows] = await db.query(query, params);
        expenses = expenseRows;

        if (expenses.length === 0) {
            return res.json({ message: "Empty expense list" });
        }

        let totalQuery = query.replace("*", "SUM(amount) AS totalAmount");
        const [totalamt] = await db.query(totalQuery, params);
        totalAmount = parseFloat(totalamt[0].totalAmount) || 0;

        res.json({ totalAmount, expenses });

        
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal Server Error. Cannot read expenses"});
    }
})

router.post('/updateExpense', async (req, res) => {
    const {expense_id, column_name, new_val} = req.body;
    console.log(expense_id, column_name, new_val);
    try {
        const query = `UPDATE expenses SET ${column_name} = ? WHERE id = ?`
        await db.query(query, [parseFloat(new_val), expense_id]);
        res.json({message: "updated"});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal Server Error. Error updating table"});
    }
})



module.exports = router;
