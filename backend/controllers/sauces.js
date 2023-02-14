const Sauce = require('../models/Sauce');
const fs = require('fs');

// middleware création d'une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; // il sera créé automatiquement dans la Base de Donnée
  delete sauceObject._userId; // il sera extrait par le token d'authentification en base de donnée
  const sauce = new Sauce({
    ...sauceObject,
    _userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, 
    likes: 0,
    dislikes: 0
  });

  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' })) // erreur 200 : réussite de la requête et ressource créée
    .catch(error => res.status(400).json({ error }) // erreur 400 : incorrecte
  ); 
};

// middleware modification d'une sauce
exports.modifySauce = (req, res, next) => {
  if(req.file){
    Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
        if(req.auth.userId !== sauce.userId){ // permet qu'un utilisateur différent ne puisse pas modifier la sauce
          res.status(403).json({ message: 'utilisateur non autorisé !' })
        }
        else{
          const filename = sauce.imageUrl.split("/images")[1];

          fs.unlink(`images/${filename}`, (err) => { //suppression de l'image
            if(err) throw err;
          })
        }
      })
      .catch(error => res.status(400).json({error})
    );  
  }
  
  const sauceObject = req.file ?

  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) 
    .then(() => res.status(200).json({ message: "objet mise à jour" }))
    .catch((error) => res.status(404).json({ error })
  );
};

// middleware suppression d'une sauce
exports.deleteSauce =  (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId !== req.auth.userId) { // permet qu'un utilisateur différent ne puisse pas supprimer la sauce
        res.status(403).json({ message: 'Non autorisé' });
      }
      else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => { // unlikn permet de supprimer un fichier/image
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
            .catch(error => res.status(401).json({ error })
          );
        })
      }
    })
    .catch(error => res.status(401).json({ error })
  );
};

// middleware d'une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // findOne pour avoir les détails de la sauce en question
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }) // erreur 404 : indisponnible
  ); 
};

// middleware des sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find() // find pour avoir la liste complète des sauces
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error })
  ); 
};

// middleware des likes et dislikes
exports.likeDislike = (req, res, next) => {    
  const like = req.body.like;
  switch (like) {
    case 1 :
      Sauce.findOne( {_id: req.params.id})
      .then( sauce => {
        if (req.body.like === 1) { // permet de liker une seule fois et permet de voir si l'userId en question a deja liker
          if (sauce.usersLiked.includes(req.body.userId)) {
            res.status(401).json({ error : 'Sauce déjà liké !' });
          }
          else {
            Sauce.updateOne({_id: req.params.id}, { $inc: { likes: 1}, $push: { usersLiked: req.body.userId}, _id: req.params.id }) // On incrémente et on ajoute la nouvelle valeur
            .then(() => res.status(200).json({ message: 'Sauce appréciée' }))
            .catch((error) => res.status(400).json({ error}));
          }
        }
      })
    break;
    case -1 :
      Sauce.findOne( {_id: req.params.id})
      .then( sauce => {
        if (req.body.like === -1) { // permet de disliker une seule fois et permet de voir si l'userId en question a deja disliker
          if (sauce.usersDisliked.includes(req.body.userId)) {
            res.status(401).json({ error : 'Sauce déjà disliké !' });
          }
          else {
            Sauce.updateOne({_id: req.params.id}, { $inc: { dislikes: 1}, $push: { usersDisliked: req.body.userId}, _id: req.params.id }) // On incrémente et on ajoute la nouvelle valeur
            .then(() => res.status(200).json({ message: 'Sauce non appréciée' }))
            .catch((error) => res.status(400).json({ error}));
          }
        }
      })
    break;
    case 0 :
      Sauce.findOne( {_id: req.params.id})
      .then( sauce => {
      if((sauce.usersLiked.includes(req.body.userId)) && (req.body.like == 0)) { // Annulation Like
        Sauce.updateOne({_id: req.params.id}, { $inc: { likes: -1}, $pull: { usersLiked: req.body.userId}, _id: req.params.id }) // On incrémente et on retire la nouvelle valeur
          .then(() => res.status(200).json({ message: 'Sauce plus appréciée' }))
          .catch((error) => res.status(400).json({ error}));
      }
          
      else if((sauce.usersDisliked.includes(req.body.userId)) && (req.body.like == 0)) { // Annulation Dislike
        Sauce.updateOne( {_id: req.params.id}, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId}, _id: req.params.id}) // On incrémente et on retire la nouvelle valeur
          .then(() => res.status(200).json({ message: 'Sauce neutre' }))
          .catch((error) => res.status(400).json({ error}));
      }           
    })
    .catch((error) => res.status(400).json({ error}));
    break;
  }
}