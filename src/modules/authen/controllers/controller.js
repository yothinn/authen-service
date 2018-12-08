"use strict";
var mongoose = require("mongoose"),
  passport = require("passport"),
  _model = require("../models/model").model,
  Model = mongoose.model(_model),
  errorHandler = require("../../core/controllers/errors.server.controller"),
  _ = require("lodash"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  config = require("../../../config/config");

exports.getList = function(req, res) {
  Model.find(function(err, datas) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        status: 200,
        data: datas
      });
    }
  });
};

exports.create = function(req, res) {
  // Add missing user fields
  req.body.provider = req.body.provider ? req.body.provider : "local";
  req.body.displayname = req.body.firstname + " " + req.body.lastname;


  var mongooseModel = new Model(req.body);
  mongooseModel.createby = req.user;
  mongooseModel.save(function(err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        status: 200,
        data: data
      });
    }
  });
};

exports.me = function(req, res, next) {
  var id = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      status: 400,
      message: "Id is invalid"
    });
  }
  Model.findById(id, function(err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.data = data ? data : {};
      next();
    }
  });
};

exports.getByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      status: 400,
      message: "Id is invalid"
    });
  }

  Model.findById(id, function(err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.data = data ? data : {};
      next();
    }
  });
};

exports.read = function(req, res) {
  //Remove sensitive data
  delete req.data.password;
  delete req.data.salt;
  delete req.data.loginToken;

  res.jsonp({
    status: 200,
    data: req.data ? req.data : []
  });
};

exports.update = function(req, res) {

  // For security measurement we remove the roles from the req.body object
  var roles = req.user.roles;
  if(roles.indexOf("admin") == -1){
    delete req.body.roles;
  }
  
  var mongooseModel = _.extend(req.data, req.body);
  mongooseModel.updated = new Date();
  mongooseModel.updateby = req.user;
  mongooseModel.save(function(err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        status: 200,
        data: data
      });
    }
  });
};

exports.delete = function(req, res) {
  req.data.remove(function(err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        status: 200,
        data: data
      });
    }
  });
};


/**
 * Signup
 */
exports.signup = function(req, res, next) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  var user = new Model(req.body);
  // // Add missing user fields
  user.provider = user.provider ? user.provider : "local";
  user.displayname = user.firstname + " " + user.lastname;
  
  /**
   * กรณี Owner จะส่ง Ref1 & Ref2
   */
  if(user.ref1 && user.ref2){
    user.roles = ["owner"];
  }

  // Then save the user
  user.save(function(err, resUser) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.user = resUser;
      next();
    }
  });
};

exports.signin = function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

exports.token = function(req, res) {
  var user = req.user;
  user.password = undefined;
  user.salt = undefined;
  user.loginToken = "";
  user.loginToken = jwt.sign(_.omit(user, "password"), config.jwt.secret, {
    expiresIn: 2 * 60 * 60 * 1000
  });
  user.loginExpires = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  // return res.jsonp(user);
  res.jsonp({
    status: 200,
    token: user.loginToken
  });
};
