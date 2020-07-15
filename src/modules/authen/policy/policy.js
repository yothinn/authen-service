"use strict";

/**
 * Module dependencies.
 */
var acl = require("acl");

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ["superadmin", "admin", "manager", "user", "owner", "staff"],
      allows: [
        {
          resources: "/api/users",
          permissions: "*"
        },
        {
          resources: "/api/users/:userId",
          permissions: "*"
        },
        {
          resources: "/api/me",
          permissions: "get"
        },
        {
          resources: "/api/me",
          permissions: "put"
        },
        {
          resources: "/api/auth/refreshToken",
          permissions: "get"
        }
      ]
    },
    {
      roles: ["superadmin"],
      allows: [
        {
          resources: "/api/auth/adduser",
          permissions: "*"
        },
      ]
    }
    // ,
    // {
    //   roles: ["user", "owner", "staff"],
    //   allows: [
    //     {
    //       resources: "/api/me",
    //       permissions: "get"
    //     },
    //     {
    //       resources: "/api/me",
    //       permissions: "put"
    //     }
    //   ]
    // }
  ]);
};

/**
 * Check If Admin Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = req.user ? req.user.roles : ["guest"];

  // Check for user roles
  acl.areAnyRolesAllowed(
    roles,
    req.route.path,
    req.method.toLowerCase(),
    function (err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).send("Unexpected authorization error");
      } else {
        if (isAllowed) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          return res.status(403).json({
            message: "User is not authorized"
          });
        }
      }
    }
  );
};
