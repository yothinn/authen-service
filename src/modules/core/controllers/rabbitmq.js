const amqp = require("amqplib/callback_api");

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";

const ON_DEATH = require("death");

module.exports.publish = function(ex, msgKey, msgPayload) {
  amqp.connect(AMQP_URL, function(err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return;
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return;
    });

    console.log("[AMQP] connected");

    conn.createChannel(function(err, ch) {
      if (err) return;
      ch.on("error", function(err) {
        console.error("[AMQP] channel error", err.message);
      });
      ch.on("close", function() {
        console.log("[AMQP] channel closed");
      });
      ch.assertExchange(ex, "direct", { durable: true });
      ch.publish(ex, msgKey, Buffer.from(msgPayload));
    //   console.log(" [X] Sent '%s' ", msgKey);
      return "";
    });
    ON_DEATH(function(signal, err) {
      console.log("clear");
      setTimeout(function() {
        conn.close();
        process.emit(0);
      }, 500);
    });
  });
};

module.exports.consume = function(ex, qname, msgKey, invkFn) {
  amqp.connect(AMQP_URL, function(err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return;
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return;
    });

    console.log("[AMQP] connected");

    conn.createChannel(function(err, ch) {
      if (err) return;
      ch.on("error", function(err) {
        console.error("[AMQP] channel error", err.message);
      });
      ch.on("close", function() {
        console.log("[AMQP] channel closed");
      });
      ch.assertExchange(ex, "direct", { durable: true });
      // ch.assertQueue(qname, { exclusive: false }, function (err, q) {

      // })
      ch.assertQueue(qname, {
        exclusive: false
      });

      ch.bindQueue(qname, ex, msgKey);

      ch.consume(
        qname,
        function(msg) {
          // console.log("======");
          invkFn(msg);

          ON_DEATH(function(signal, err) {
            // console.log("clear");
            setTimeout(function() {
              conn.close();
              process.emit(0);
            });
          });
        },
        { noAck: true }
      );
    });
  });
};
