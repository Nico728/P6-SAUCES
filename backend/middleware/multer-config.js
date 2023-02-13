const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => { // indique à multer où enregistrer les fichier
        callback(null, 'images') // pour nous se sera dans le dossier images
    },
    filename: (req, file, callback) => { // on garde le nom d'origine mais on
        const name = file.originalname.split(' ').join('_'); // supprime les espaces dans le nom du fichier
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');