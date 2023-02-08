const express =require('express');
const router = express.Router(); // On appel Express pour créer le router de chaque midellware

const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const saucesCtrl = require('../controllers/sauces');


router.post('/', auth, multer, saucesCtrl.createSauce); // création sauce
router.put('/:id', auth, multer, saucesCtrl.modifySauce); // modification sauce
router.delete('/:id', auth, saucesCtrl.deleteSauce);  // suppression sauce
router.get('/:id', auth, saucesCtrl.getOneSauce);  // une sauce
router.get('/', auth, saucesCtrl.getAllSauce);  // les sauces
router.post('/:id/like', auth, saucesCtrl.likeDislike); //like ou dislike des sauces

module.exports = router;