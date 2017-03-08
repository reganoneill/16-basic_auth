'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('cfgram:gallery-route-test');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const Gallery = require('../model/gallery.js');
const User = require('../model/user.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'tester name',
  password: 'tester password',
  email: 'test@test.com'
};
const exampleGallery = {
  name: 'test gallery',
  description: 'descriptive test'
};
const exampleUpdatedGallery = {
  name: 'updated test gallery',
  description: 'updated descriptive test'
};
const exampleBadUpdatedGallery = {
  description: 'updated descriptive test'
};
const badID = 6666666666666;

describe('Gallery Routes', function(){

  afterEach( done => {
      Promise.all([
        User.remove({}),
        Gallery.remove({})
      ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/gallery', () => {
    describe('a valid request', function(){
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      it('should return a gallery (post request)', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.description).to.equal(exampleGallery.description);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('invalid');
          expect(res.status).to.equal(200);
          done();
        });
      });
   });

   describe('a request with no token', function(){
     before( done => {
       new User(exampleUser)
       .generatePasswordHash(exampleUser.password)
       .then( user => user.save())
       .then( user => {
         this.tempUser = user;
         return user.generateToken();
       })
       .then( token => {
         this.tempToken = token;
         done();
       })
       .catch(done);
     });
     it('should return a 401 because of no token', done => {
       request.post(`${url}/api/gallery`)
       .send(exampleGallery)
       .end((err, res) => {
         expect(res.status).to.equal(401);
         done();
       });
     });
  });

  describe('no request body or invalid request body returns 400', function(){
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    it('should return a 400 because of no token', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleBadUpdatedGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
 });
});//end post


    describe('GET: /api/gallery/:id', () => {

      describe('with a valid request', function(){
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken()
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      before( done => {
        exampleGallery.userID = this.tempUser._id.toString();
        new Gallery(exampleGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });
      after( () => {
        delete exampleGallery.userID;
      });
      it('should GET return a gallery', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created.toString());
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.description).to.equal(exampleGallery.description);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('invalid date');
          expect(res.status).to.equal(200);
          done();
        });
      });
     });

     describe('with an invalid request', function(){
     before( done => {
       new User(exampleUser)
       .generatePasswordHash(exampleUser.password)
       .then( user => user.save())
       .then(user => {
         this.tempUser = user;
         return user.generateToken()
       })
       .then( token => {
         this.tempToken = token;
         done();
       })
       .catch(done);
     });
     before( done => {
       exampleGallery.userID = this.tempUser._id.toString();
       new Gallery(exampleGallery).save()
       .then( gallery => {
         this.tempGallery = gallery;
         done();
       })
       .catch(done);
     });
     after( () => {
       delete exampleGallery.userID;
     });
     it('should return a 401 for no token', done => {
       request.get(`${url}/api/gallery/${this.tempGallery._id}`)
       .end((err, res) => {
         expect(res.status).to.equal(401);
         done();
       });
     });
     });

     describe('with a valid request and no id foud', function(){
     before( done => {
       new User(exampleUser)
       .generatePasswordHash(exampleUser.password)
       .then( user => user.save())
       .then(user => {
         this.tempUser = user;
         return user.generateToken()
       })
       .then( token => {
         this.tempToken = token;
         done();
       })
       .catch(done);
     });
     before( done => {
       exampleGallery.userID = this.tempUser._id.toString();
       new Gallery(exampleGallery).save()
       .then( gallery => {
         this.tempGallery = gallery;
         done();
       })
       .catch(done);
     });
     after( () => {
       delete exampleGallery.userID;
     });
     it('should return a 404 for no id found', done => {
       request.get(`${url}/api/gallery/${badID}`)
       .set({
         Authorization: `Bearer ${this.tempToken}`
       })
       .end((err, res) => {
         expect(res.status).to.equal(404);
         done();
       });
     });
     });
   });//end GET


   describe('PUT: /api/gallery/:id', function() {
     describe('with a valid body', () => {

     before( done => {
       new User(exampleUser)
       .generatePasswordHash(exampleUser.password)
       .then( user => user.save())
       .then(user => {
         this.tempUser = user;
         return user.generateToken()
       })
       .then( token => {
         this.tempToken = token;
         done();
       })
       .catch(done);
     });
     before( done => {
       exampleGallery.userID = this.tempUser._id.toString();
       new Gallery(exampleGallery).save()
       .then( gallery => {
         this.tempGallery = gallery;
         done();
       })
       .catch(done);
     });
     after( () => {
       delete exampleGallery.userID;
     });
     it('should return a 400 for invalid body', done => {
       request.put(`${url}/api/gallery/${this.tempGallery._id}`)
       .send(exampleUpdatedGallery)
       .set({
         Authorization: `Bearer ${this.tempToken}`
       })
       .end((err, res) => {
         expect(res.body.name).to.equal(exampleUpdatedGallery.name);
         expect(res.body.description).to.equal(exampleUpdatedGallery.description);
         expect(res.status).to.equal(200);
         done();
       });
     });
    });
    describe('with an invalid body', () => {
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken()
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    before( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    after( () => {
      delete exampleGallery.userID;
    });
    it('should return an updated gallery (put request)', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send(exampleBadUpdatedGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
   });

   describe('with an invalid token', () => {
   before( done => {
     new User(exampleUser)
     .generatePasswordHash(exampleUser.password)
     .then( user => user.save())
     .then(user => {
       this.tempUser = user;
       return user.generateToken()
     })
     .then( token => {
       this.tempToken = token;
       done();
     })
     .catch(done);
   });
   before( done => {
     exampleGallery.userID = this.tempUser._id.toString();
     new Gallery(exampleGallery).save()
     .then( gallery => {
       this.tempGallery = gallery;
       done();
     })
     .catch(done);
   });
   after( () => {
     delete exampleGallery.userID;
   });
   it('should return a 401 due to no token', done => {
     request.put(`${url}/api/gallery/${this.tempGallery._id}`)
     .send(exampleUpdatedGallery)
     .end((err, res) => {
       expect(res.status).to.equal(401);
       done();
     });
   });
  });

  describe('with an invalid id should return 404', () => {
  before( done => {
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then(user => {
      this.tempUser = user;
      return user.generateToken()
    })
    .then( token => {
      this.tempToken = token;
      done();
    })
    .catch(done);
  });
  before( done => {
    exampleGallery.userID = this.tempUser._id.toString();
    new Gallery(exampleGallery).save()
    .then( gallery => {
      this.tempGallery = gallery;
      done();
    })
    .catch(done);
  });
  after( () => {
    delete exampleGallery.userID;
  });
  it('should return a 404 - id not found', done => {
    request.put(`${url}/api/gallery/${badID}`)
    .send(exampleUpdatedGallery)
    .set({
      Authorization: `Bearer ${this.tempToken}`
    })
    .end((err, res) => {
      expect(res.status).to.equal(404);
      done();
    });
  });
  });
});//end PUT

describe('DELETE: /api/gallery/:id', () => {

  describe('with a valid request', function(){
  before( done => {
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then(user => {
      this.tempUser = user;
      return user.generateToken()
    })
    .then( token => {
      this.tempToken = token;
      done();
    })
    .catch(done);
  });
  before( done => {
    exampleGallery.userID = this.tempUser._id.toString();
    new Gallery(exampleGallery).save()
    .then( gallery => {
      this.tempGallery = gallery;
      done();
    })
    .catch(done);
  });
  after( () => {
    delete exampleGallery.userID;
  });
  it('should DELETE and return a gallery', done => {
    request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
    .set({
      Authorization: `Bearer ${this.tempToken}`
    })
    .end((err, res) => {
      if(err) return done(err);
      debug(res.body.name);
      expect(res.body.name).to.equal(exampleGallery.name);
      // expect(res.body.description).to.equal(exampleGallery.description);
      // expect(res.body.userID).to.equal(this.tempUser._id.toString());
      // expect(date).to.not.equal('invalid date');
      expect(res.status).to.equal(200);
      done();
    });
  });
 });



 describe('with an invalid request', function(){
 before( done => {
   new User(exampleUser)
   .generatePasswordHash(exampleUser.password)
   .then( user => user.save())
   .then(user => {
     this.tempUser = user;
     return user.generateToken()
   })
   .then( token => {
     this.tempToken = token;
     done();
   })
   .catch(done);
 });
 before( done => {
   exampleGallery.userID = this.tempUser._id.toString();
   new Gallery(exampleGallery).save()
   .then( gallery => {
     this.tempGallery = gallery;
     done();
   })
   .catch(done);
 });
 after( () => {
   delete exampleGallery.userID;
 });
 it('should return a 401 for no token', done => {
   request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
   .end((err, res) => {
     expect(res.status).to.equal(401);
     done();
   });
 });
});



describe('valid request with an id that was not found', function(){
  before( done => {
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then(user => {
      this.tempUser = user;
      return user.generateToken()
    })
    .then( token => {
      this.tempToken = token;
      done();
    })
    .catch(done);
  });
  before( done => {
    exampleGallery.userID = this.tempUser._id.toString();
    new Gallery(exampleGallery).save()
    .then( gallery => {
      this.tempGallery = gallery;
      done();
    })
    .catch(done);
  });
  after( () => {
    delete exampleGallery.userID;
  });
  it('should return a 404 because of a bad id', done => {
    request.delete(`${url}/api/gallery/${badID}`)
    .set({
      Authorization: `Bearer ${this.tempToken}`
    })
    .end((err, res) => {
      expect(res.status).to.equal(404);
      done();
   });
  });
 });
});//end delete

});
