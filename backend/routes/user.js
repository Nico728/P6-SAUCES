const express =require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');


router.post('/signup', userCtrl.signup); // inscription
router.post('/login', userCtrl.login);  // connexion

module.exports = router;