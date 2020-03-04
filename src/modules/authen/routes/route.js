"use strict";
var controller = require("../controllers/controller"),
  mq = require('../../core/controllers/rabbitmq'),
  policy = require("../policy/policy");


module.exports = function (app) {

  // for admin manage users
  app
    .route("/api/users")
    .all(policy.isAllowed)
    .get(controller.getList)
    .post(controller.create);

  app
    .route("/api/users/:userId")
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

    app
    .route("/api/auth/refreshToken")
    .all(policy.isAllowed)
    .get(controller.me, controller.refreshToken)

  // for everyone signin or signup
  app.route("/api/auth/signup").post(controller.signup, controller.token);
  app.route("/api/auth/signin").post(controller.signin, controller.token);

  app.param("userId", controller.getByID);


  //rabbitMQ
  mq.consume('casan', 'apporve', 'updatestatus', (msg) => {
    console.log(msg.content.toString())
    console.log(JSON.parse(msg.content))
    var user = JSON.parse(msg.content);
    controller.updateStatusApporveToOwner(user);
  })
  mq.consume('casanteam', 'apporveteam', 'updatestatusteam', (msg) => {
    console.log(msg.content.toString())
    console.log(JSON.parse(msg.content))
    var user = JSON.parse(msg.content);
    controller.updateStatusToOwnerAndStaff(user);
  })

  // mq.consume('School', 'School-created', 'created', (msg) => {
  //   var school = JSON.parse(msg.content);
  //   // console.log(school);
  //   controller.updateOwnerRef1(school);
  // })

  

};
