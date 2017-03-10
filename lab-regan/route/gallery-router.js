'use strict';

const debug = require('debug')('cfgram:gallery-router');
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('DELETE: /api/gallery/:id');
  Gallery.findByIdAndRemove(req.params.id)
  .then( removed => res.json(removed))
  .catch(next);
});

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST: /api/gallery');
  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => {
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET: /api/gallery');
  Gallery.findById(req.params.id)
  .then( gallery => {
    if(gallery.userID.toString() !== req.user._id.toString()){
      return next(createError(401, 'bad user name'));
    };
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/gallery/:id');
  if(!req.body.name){
    return next(createError(400, 'Invalid body'));
  };

  if(!req.body.description){
    return next(createError(400, 'Invalid description'));
  };
  Gallery.findByIdAndUpdate(req.params.id, {$set: req.body }, {new: true})
  .then( updatedGallery => res.json(updatedGallery))
  .catch(next);
});
