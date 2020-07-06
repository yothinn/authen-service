"use strict";

var Model = "User";
exports.model = Model;

// use model
var validator = require("validator");
var bcrypt = require("bcrypt");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var validateLocalStrategyEmail = function (email) {
  return (
    (this.provider !== "local" && !this.updated) || validator.isEmail(email)
  );
};

var ModelSchema = new Schema({
  statusmember: {
    type: String,
    enum: ['waitapprove', 'approve', 'retire'],
    default: ['waitapprove']
  },
  remarkrejectteam: {
    type: [{
      datereject: {
        type: Date,
        default: Date.now
      },
      remark: {
        type: String
      }
    }]
  },
  historyaboutteam: {
    type: [{
      teamname: {
        type: String
      },
      teamid: {
        type: String
      },
      datereject: {
        type: Date,
        default: Date.now
      },
    }]
  },
  firstname: {
    type: String,
    trim: true,
    default: "",
    required: "Please fill in your first name"
  },
  lastname: {
    type: String,
    trim: true,
    default: "",
    required: "Please fill in your last name"
  },
  displayname: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    default: "",
    validate: [validateLocalStrategyEmail, "Please fill a valid email address"]
  },
  username: {
    type: String,
    unique: "Username already exists",
    required: "Please fill in a username",
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    default: ""
  },
  ref1: {
    type: String
  },
  ref2: {
    type: String
  },
  ref3: {
    type: String
  },
  ref4: {
    type: String
  },
  ref5: {
    type: String
  },
  refnum1: {
    type: Number
  },
  refnum2: {
    type: Number
  },
  refnum3: {
    type: Number
  },
  refnum4: {
    type: Number
  },
  refnum5: {
    type: Number
  },
  salt: {
    type: String
  },
  profileImageURL: {
    type: String,
    default:
      "http://res.cloudinary.com/hflvlav04/image/upload/v1487834187/g3hwyieb7dl7ugdgj3tb.png"
  },
  provider: {
    type: String,
    required: "Provider is required"
  },
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [
      {
        type: String,
        enum: [
          "user", 
          "staff", 
          "owner",
          "manager", 
          "admin",
          "superadmin"
        ]
      }
    ],
    default: ["staff"],
    required: "Please provide at least one role"
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  loginToken: {
    type: String
  },
  loginExpires: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createby: {
    _id: {
      type: String
    },
    username: {
      type: String
    },
    displayName: {
      type: String
    }
  },
  updateby: {
    _id: {
      type: String
    },
    username: {
      type: String
    },
    displayName: {
      type: String
    }
  }
});

//hashing a password before saving it to the database
ModelSchema.pre("save", function (next) {
  var user = this;
  var round = 13;
  this.salt = bcrypt.genSaltSync(round);
  if (this.isModified('password')) {
    bcrypt.hash(user.password, this.salt, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  } else {
    next();
  }

});

mongoose.model(Model, ModelSchema);
