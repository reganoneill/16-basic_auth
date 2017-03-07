'use strict';

const createError = require('http-errors');
const debug = require('debug')('cfgram:error-middleware');

module.exports = function(err, req, res, next){
  debug('error-middleware');

  console.error('msg:', err.message);
  console.error('name:', err.name);

//400 solution
  if(err.message === 'data and salt arguments required'){
    err = createError(400, 'so bad');
    res.status(err.status).send(err.name);
    next();
    return;
  };

  if(err.status){
    res.status(err.status).send(err.name);
    next();
    return;
  };

  if(err.name === 'ValidationError'){
    err = createError(400, err.message);
    res.status(err.status).send(err.name);
    next();
    return;
  };

  err = createError(500, err.message);
  res.status(err.status).send(err.name);
  next();
};
