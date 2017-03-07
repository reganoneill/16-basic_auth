'use script';

const debug = require('debug')('cfgram:auth-route-test');
const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'exampleuser',
  password: '9876',
  email: 'example@example.com'
};

describe('Auth Routes', function(){
  describe('POST: /api/signup', function(){
    describe('with a valid body', function(){
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          // expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with an invalid body', function(){
      it('should return a 400', done => {
        request.post(`${url}/api/signup`)
        .send()
        .end((err, res) => {
          // if(err) return done(err);
          debug(err.name);
          debug(err.status);
          debug(err.message);
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
  });//end post test

  describe('GET: /api/signin', function(){
      describe('with a valid body', function(){
        before( done => {
          let user = new User(exampleUser);
          user.generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            done();
          })
          .catch(done);
        });
        after( done => {
          User.remove({})
          .then( () => done())
          .catch(done);
        });
        it('should a token', done => {
          request.get(`${url}/api/signin`)
          .auth('exampleuser', '9876')
          .end((err, res) => {
            if(err) return done(err);
            console.log('temporary user: ', this.tempUser);
            console.log('GET: /apl/signin token ', res.text);
            expect(res.status).to.equal(200);
            done();
          });
        });
      });
    });//end GET /api/signin
});
