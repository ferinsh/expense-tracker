const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) res.status(401).json({message: "Access Denied"});
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(401).json({message: "Invalid token"});
            
        }
        req.user = user;
        next();
    })
}

module.exports = {verifyToken}