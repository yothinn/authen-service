"use strict";
var request = require("supertest"),
  assert = require("assert"),
  should = require("should"),
  mongoose = require("mongoose"),
  _model = require("../models/model").model,
  app = require("../../../config/express"),
  Model = mongoose.model(_model);

var credentials;

describe(_model + " Authentication routes tests", function () {
  before(function (done) {
    credentials = {
      username: "username",
      password: "password",
      firstname: "firstname",
      lastname: "lastname",
      email: "test@email.com"
    };
    done();
  });

  it("should be " + _model + " signup", function (done) {
    request(app)
      .post("/api/auth/signup")
      .send(credentials)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        var resp = res.body;
        assert.equal(resp.status, 200);
        assert.notEqual(resp.token, null);
        done();
      });
  });

  it("should be " + _model + " signin", function (done) {
    request(app)
      .post("/api/auth/signin")
      .send(credentials)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        var resp = res.body;
        assert.equal(resp.status, 200);
        assert.notEqual(resp.token, null);
        done();
      });
  });

  it("should be " + _model + " signup with role admin", function (done) {
    credentials = {
      username: "admin",
      password: "password",
      firstname: "admin",
      lastname: "lastname",
      email: "admin@email.com",
      roles: ["admin"]
    };
    request(app)
      .post("/api/auth/signup")
      .send(credentials)
      .expect(200)
      .end(function (err, res) {
        assert.equal(res.body.status, 200);
        assert.notEqual(res.body.token, null);

        request(app)
          .get("/api/me")
          .set("Authorization", "Bearer " + res.body.token)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var resp = res.body;
            assert.equal(resp.status, 200);
            assert.equal(resp.data.username, credentials.username);
            assert.equal(resp.data.firstname, credentials.firstname);
            assert.equal(resp.data.lastname, credentials.lastname);
            assert.equal(resp.data.email, credentials.email);
            assert.equal(
              resp.data.displayname,
              credentials.firstname + " " + credentials.lastname
            );
            assert.notEqual(resp.data.roles, credentials.roles);
            done();
          });
      });
  });

  it(
    "should be " + _model + " signup duplicate username (status 400)",
    function (done) {
      credentials = {
        username: "username",
        password: "password",
        firstname: "firstname",
        lastname: "lastname",
        email: "test1@email.com"
      };
      request(app)
        .post("/api/auth/signup")
        .send(credentials)
        .expect(400)
        .end(function (err, res) {
          assert.notEqual(
            res.body.message.toLowerCase().indexOf("username already exists"),
            -1
          );
          done();
        });
    }
  );

  it("should be " + _model + " signup duplicate email (status 400)", function (
    done
  ) {
    credentials = {
      username: "username1",
      password: "password",
      firstname: "firstname",
      lastname: "lastname",
      email: "test@email.com"
    };

    request(app)
      .post("/api/auth/signup")
      .send(credentials)
      .expect(400)
      .end(function (err, res) {
        assert.notEqual(
          res.body.message.toLowerCase().indexOf("email already exists"),
          -1
        );
        done();
      });
  });

  it(
    "should be " + _model + " signup if no firstname is provided (status 400)",
    function (done) {
      credentials = {
        username: "username1",
        password: "password",
        firstname: "",
        lastname: "lastname",
        email: "test@email.com"
      };

      request(app)
        .post("/api/auth/signup")
        .send(credentials)
        .expect(400)
        .end(function (err, res) {
          assert.notEqual(
            res.body.message
              .toLowerCase()
              .indexOf("please fill in your first name"),
            -1
          );
          done();
        });
    }
  );

  it(
    "should be " + _model + " signup if no lastname is provided (status 400)",
    function (done) {
      credentials = {
        username: "username1",
        password: "password",
        firstname: "firstname",
        lastname: "",
        email: "test@email.com"
      };

      request(app)
        .post("/api/auth/signup")
        .send(credentials)
        .expect(400)
        .end(function (err, res) {
          assert.notEqual(
            res.body.message
              .toLowerCase()
              .indexOf("please fill in your last name"),
            -1
          );
          done();
        });
    }
  );

  it("should be " + _model + " get profile logged in use token", function (
    done
  ) {
    credentials = {
      username: "username",
      password: "password",
      firstname: "firstname",
      lastname: "lastname",
      email: "test@email.com"
    };
    request(app)
      .post("/api/auth/signin")
      .send(credentials)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        request(app)
          .get("/api/me")
          .set("Authorization", "Bearer " + res.body.token)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var resp = res.body;
            assert.equal(resp.status, 200);
            assert.equal(resp.data.username, credentials.username);
            assert.equal(resp.data.firstname, credentials.firstname);
            assert.equal(resp.data.lastname, credentials.lastname);
            assert.equal(resp.data.email, credentials.email);
            assert.equal(
              resp.data.displayname,
              credentials.firstname + " " + credentials.lastname
            );
            done();
          });
      });
  });

  it("should be " + _model + " update profile regitered use token", function (
    done
  ) {
    credentials = {
      username: "username",
      password: "password",
      firstname: "firstname",
      lastname: "lastname",
      email: "test@email.com"
    };
    request(app)
      .post("/api/auth/signin")
      .send(credentials)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        credentials.ref1 = "1234567890123";
        credentials.adminKey = "1234567890123";
        request(app)
          .put("/api/me")
          .set("Authorization", "Bearer " + res.body.token)
          .send(credentials)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var resp = res.body;
            assert.equal(resp.status, 200);
            assert.equal(resp.data.username, credentials.username);
            assert.equal(resp.data.firstname, credentials.firstname);
            assert.equal(resp.data.lastname, credentials.lastname);
            assert.equal(resp.data.email, credentials.email);
            assert.equal(
              resp.data.displayname,
              credentials.firstname + " " + credentials.lastname
            );
            assert.equal(resp.data.ref1, credentials.ref1);
            request(app)
              .post("/api/auth/signin")
              .send(credentials)
              .expect(200)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                done();
              });
          });
      });
  });

  xit("should be " + _model + " manage users profile use admin token", function (
    done
  ) {
    credentials = {
      username: "admin1",
      password: "admin1",
      firstname: "admin1",
      lastname: "mymarket",
      roles: ["admin"],
      provider: "local",
      email: "admin1@email.com"
    };

    var user = {
      username: "user1",
      password: "1",
      firstname: "u1",
      lastname: "lu1",
      email: "u1@email.com",
      ref1: "1234567890123"
    };
    var admin = new Model(credentials);
    admin.save(function (err) {
      should.not.exist(err);

      request(app)
        .post("/api/auth/signin")
        .send(credentials)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          var token = res.body.token;
          request(app)
            .post("/api/users")
            .set("Authorization", "Bearer " + token)
            .send(user)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var resp = res.body;
              assert.equal(resp.status, 200);
              assert.equal(resp.data.username, user.username);
              assert.equal(resp.data.firstname, user.firstname);
              assert.equal(resp.data.lastname, user.lastname);
              assert.equal(resp.data.email, user.email);
              assert.equal(
                resp.data.displayname,
                user.firstname + " " + user.lastname
              );
              assert.equal(resp.data.ref1, user.ref1);
              user.ref2 = "test update"
              request(app)
                .put("/api/users/" + resp.data._id)
                .set("Authorization", "Bearer " + token)
                .send(user)
                .expect(200)
                .end(function (err, res) {
                  if (err) {
                    return done(err);
                  }
                  var respUpd = res.body;
                  assert.equal(respUpd.status, 200);
                  assert.equal(respUpd.data.username, user.username);
                  assert.equal(respUpd.data.firstname, user.firstname);
                  assert.equal(respUpd.data.lastname, user.lastname);
                  assert.equal(respUpd.data.email, user.email);
                  assert.equal(
                    respUpd.data.displayname,
                    user.firstname + " " + user.lastname
                  );
                  assert.equal(respUpd.data.ref1, user.ref1);
                  assert.equal(respUpd.data.ref2, user.ref2);
                  done();
                });
            });
        });
    });
  });


  after(function (done) {
    Model.remove().exec(done);
  });
});
