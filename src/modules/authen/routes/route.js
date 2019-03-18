"use strict";
var controller = require("../controllers/controller"),
  mq = require('../../core/controllers/rabbitmq'),
  policy = require("../policy/policy");
module.exports = function(app) {
  
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

  // for everyone signin or signup
  app.route("/api/auth/signup").post(controller.signup, controller.token);
  app.route("/api/auth/signin").post(controller.signin, controller.token);

  app.param("userId", controller.getByID);

  // mq.consume('casan','reservations','getuser', (msg)=>{
  //   console.log(msg.content.toString())
  //   var user_id = msg.content.toString();
  //   controller.getuserReservations(shop_id)
  // })
  mq.consume('casan','apporve','updatestatus', (msg)=>{
    console.log(msg.content.toString())
    console.log(JSON.parse(msg.content))
    var user = JSON.parse(msg.content);
    if (user.status === "apporve") {
      controller.updateStatusApporveToOwner(user);
    }
    if (user.status === "staff") {
    controller.updateStatusToOwnerAndStaff(user);
    }
  })

};
