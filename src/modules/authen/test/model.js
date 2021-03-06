'use strict';
var should = require('should'),
    mongoose = require('mongoose'),
    _model = require('../models/model').model,
    Model = mongoose.model(_model);

var user;

describe(_model + ' Model save tests', function () {

    before(function (done) {
        user = {
            firstname: 'Full',
            lastname: 'Name',
            displayname: 'Full Name',
            email: '_test@test.com',
            username: '_username',
            password: '1',
            provider: 'local',
            ref1: 'ref1',
            ref2: 'ref2'
        };
        done();
    });

    it('should be able to save without problems', function (done) {
        var _user = new Model(user);
        _user.save(function (err) {
            should.not.exist(err);
            _user.remove(function (err) {
                should.not.exist(err);
                done();
            });
        });
    });
});