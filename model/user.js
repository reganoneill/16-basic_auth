'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('cfgram:user');
const Promise = require('bluebird');
const createError = require('http-errors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  findHash: {type: String, unique: true}
});

userSchema.methods.generatePasswordHash = function(password){
  debug('generatePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if(err) return reject(err);
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(password){
  debug('comparePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
        if(err) return reject(err);
        if(!valid) return reject(createError(401, 'wrong password'));
        resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function(){
  debug('generateFindHash');
  return new Promise((resolve, reject) => {
    let tries = 0;
    _generateFindHash.call(this);
    function _generateFindHash(){
      debug('ok we are also herererere');
      debug(crypto.randomBytes(32).toString('hex'));
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then( () => resolve(this.findHash))
      .catch( err => {
        debug('we are in the catch statement');
        if(tries > 3) return reject(err);
        tries++;
        _generateFindHash.call(this);
      });
    };
  });
};

userSchema.methods.generateToken = function(){
  debug('generateToken');
  return new Promise((resolve, reject) => {
    this.generateFindHash()
    .then( findHash => resolve(jwt.sign({token: findHash}, process.env.APP_SECRET )))
    .catch( err => reject(err));
  });
};

module.exports = mongoose.model('user', userSchema);
