const Sauce = require('../models/Sauce');
const fs = require('fs');

// middleware création d'une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
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
        const filename = sauce.imageUrl.split("/images")[1];

        fs.unlink(`images/${filename}`, (err) => { //suppression de l'image
          if(err) throw err;
        })
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
      if (sauce.userId !== req.auth.userId) {
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
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }) // erreur 404 : indisponnible
  ); 
};

// middleware des sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error })
  ); 
};

// middleware des likes et dislikes
exports.likeDislike = (req, res, next) => {    
  const like = req.body.like;
  switch (like) {
    case 1 :
      Sauce.updateOne({_id: req.params.id}, { $inc: { likes: 1}, $push: { usersLiked: req.body.userId}, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce appréciée' }))
      .catch((error) => res.status(400).json({ error}));
    break;
    case -1 :
      Sauce.updateOne({_id: req.params.id}, { $inc: { dislikes: 1}, $push: { usersDisliked: req.body.userId}, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce non appréciée' }))
      .catch((error) => res.status(400).json({ error}));
    break;
    case 0 :
      Sauce.findOne( {_id: req.params.id})
    .then( sauce => {
      if( sauce.usersLiked.indexOf(req.body.userId)!== -1){ // Annulation Like
        Sauce.updateOne({_id: req.params.id}, { $inc: { likes: -1},$pull: { usersLiked: req.body.userId}, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce plus appréciée' }))
          .catch((error) => res.status(400).json({ error}));
      }
          
      else if( sauce.usersDisliked.indexOf(req.body.userId)!== -1) { // Annulation Dislike
        Sauce.updateOne( {_id: req.params.id}, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId}, _id: req.params.id})
          .then(() => res.status(200).json({ message: 'Sauce neutre' }))
          .catch((error) => res.status(400).json({ error}));
      }           
    })
    .catch((error) => res.status(400).json({ error}));
    break;
  }
}