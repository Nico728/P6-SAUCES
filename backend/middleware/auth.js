const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // récupération du token de la requête 
        const decodedToken = jwt.verify(token, process.env.TOKEN_P6); // vérification avec le code token_p6
        const userId = decodedToken.userId; // récupération de l'id du token
        req.auth = {
            userId: userId
        };
        next();
    }
    catch {
        res.status(401).json({ error });
    }
};