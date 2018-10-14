"use strict";
var _model = require("../models/model").model,
  controller = require("../controllers/controller"),
  policy = require("../policy/policy");
module.exports = function(app) {
  var url = "/api/" + _model;
  var urlWithParam = "/api/" + _model + "/:" + _model + "id";

  // for admin manage users
  app
    .route(url)
    .all(policy.isAllowed)
    .get(controller.getList)
    .post(controller.create);

  app
    .route(urlWithParam)
    .all(policy.isAllowed)
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete);

  // for user manage theirs profile
  app
    .route("/api/me")
    .all(policy.isAllowed)
    .get(controller.me, controller.read)
    .put(controller.me, controller.update);

  // for everyone signin or signup
  app.route("/api/auth/signup").post(controller.signup, controller.token);
  app.route("/api/auth/signin").post(controller.signin, controller.token);

  app.param(_model + "id", controller.getByID);
};
