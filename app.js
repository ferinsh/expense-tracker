require('dotenv').config();
const express = require('express');
const cors = require("cors");
const accountRouter = require('./route/account');
const expenseRouter = require('./route/expense');


const {verifyToken} = require('./controller/accountController');

app = express();
app.use(cors());
app.use(express.json());

app.use('/account', accountRouter);

app.use('/expense', verifyToken, expenseRouter);

app.use('/', (req, res) => {
    res.json({
        message: "Welcome to ET API",
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
