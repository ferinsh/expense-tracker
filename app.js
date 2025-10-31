require('dotenv').config();
const express = require('express');
const accountRouter = require('./route/account');
const expenseRouter = require('./route/expense');

const {verifyToken} = require('./controller/accountController');

app = express();
app.use(express.json());

app.use('/account', accountRouter);

app.use('/expense', verifyToken, expenseRouter);

app.use('/', (req, res) => {
    res.json({
        message: "Welcome to ET API",
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));