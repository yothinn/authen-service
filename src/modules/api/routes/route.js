"use strict";
var _model = require("../models/model").model,
  controller = require("../controllers/controller"),
  policy = require("../policy/policy");
module.exports = function(app) {
  var url = "/api/" + _model;
  // var urlWithParam = '/api/' + _model + '/:' + _model + 'id';

  app
    .route("/api/me")
    .all(policy.isAllowed)
    .get(controller.getUser)
    .put(controller.me, controller.update);

  app.route("/api/auth/signup").post(controller.signup, controller.token);
  app.route("/api/auth/signin").post(controller.signin, controller.token);

  // app.param(_model + 'id', controller.getByID);
};
