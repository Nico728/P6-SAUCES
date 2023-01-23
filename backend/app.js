const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

// MONGOOSE CONNECT
mongoose.connect('mongodb+srv://Piiquante:Piiquante@cluster0.4uwcpxs.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;