const express =require('express');
const router = express.Router(); // On appel Express pour créer le router de chaque midellware 
const userCtrl = require('../controllers/user');


router.post('/signup', userCtrl.signup); // inscription
router.post('/login', userCtrl.login);  // connexion

module.exports = router;