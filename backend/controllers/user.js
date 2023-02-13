const bcrypt = require('bcrypt');  // Importation pour hacher le mot de passe
const jwt = require('jsonwebtoken'); // Imporation pour chiffrés les tokens et les utiliser pour se connecter
const User = require('../models/user');
require('dotenv').config();

// Inscription
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // hashage du mdp
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save() // sauvegarde dans la base de données
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(500).json({ error })
            );
        })
        .catch(error => res.status(500).json({ error })
    );
};

// Connexion
exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if(user === null) {
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
            }
            else { // Utilisation méthode compare() de bcrypt pour comparer le mot de passe  envoyé par l'utilisateur avec le hash qui est enregistré et le user dans la base de donnée
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if(!valid) {
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
                        }
                        else {
                            res.status(201).json({
                                userId: user._id,
                                token: jwt.sign( // permet de chiffrer un nouveau token
                                    { userId: user._id }, // le token contien l'ID de l'utilisateur 
                                    process.env.TOKEN_P6, // key du token dans fichier .env
                                    { expiresIn: '24h' } // temps de validité du token
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error })
                );
            }
        })
        .catch(error => res.status(500).json({ error })
    );
};