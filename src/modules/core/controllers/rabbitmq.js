const amqp = require('amqplib/callback_api');

const AMQP_URL = process.env.AMQP_URL;

const ON_DEATH = require('death');

module.exports.publish = function (ex, msgKey, msgPayload) {
    amqp.connect(AMQP_URL, function (err, conn) {
        conn.createChannel(function (err, ch) {
            ch.assertExchange(ex, 'direct', { durable: true });
            ch.publish(ex, msgKey, Buffer.from(msgPayload));
            console.log(" [X] Sent '%s' ", msgKey);
            return '';

        });
        ON_DEATH(function (signal, err) {
            console.log('clear');
            setTimeout(function () {
                conn.close();
                process.emit(0);
            }, 500);
        })
    });
}
module.exports.consume = function (ex, qname, msgKey, invkFn) {
    // var msg = 'test'
    // invkFn(msg);
    amqp.connect(AMQP_URL, function (err, conn) {
        conn.createChannel(function (err, ch) {
            ch.assertExchange(ex, 'direct', { durable: true })
            ch.assertQueue(qname, { exclusive: false }, function (err, q) {
                ch.bindQueue(q.queue, ex, msgKey);
                ch.consume(q.queue, function (msg) {
                    invkFn(msg);

                    ON_DEATH(function (signal, err) {
                        console.log('clear');
                        setTimeout(function () {
                            conn.close();
                            process.emit(0);
                        })
                    })
                }, { noAck: true })
            })
        })

    })
}
