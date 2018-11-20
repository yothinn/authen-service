'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    bcrypt = require('bcrypt'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User');

module.exports = function () {
    // Use local strategy
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
        function (username, password, done) {
            User.findOne({
                username: username.toLowerCase()
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Username or Password is invalid.'
                    });
                }
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result === true) {
                        return done(null, user);
                        next();
                    } else {
                        return done(null, false, {
                            message: 'Username or Password is invalid.'
                        });
                    }
                });
            });
        }));
};