const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

// Modèle pour enregistrer un nouvel utilisateur 
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); // unicité 

module.exports = mongoose.model('User', userSchema);