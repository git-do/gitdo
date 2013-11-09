module.exports = (function () {

  /**
  * Imports
  */
  var db = require("../db.js");

  /**
  * Constructor
  */
  function Users(req, resp) {
    this.db = db;
    this.req = req;
    this.resp = resp;
  }

  /**
  * Instance methods and variables
  */

  // Get
  Users.prototype.get = function (obj) {
    var self = this;
    this.dbGet(obj, function (err, vals) {
      self.response(err, vals);
    });
  };

  // Set
  Users.prototype.set = function (obj) {
    var self = this;
    this.dbGet(obj, function (e, v) {
      if (!e && v && !v.length) {
        self.dbCreate(obj, function (err, vals) {
          self.response(err, vals);
        });
      } else {
          self.response(409, "Conflict: Username exists");
      }
    });
  };

  // Send
  Users.prototype.send = function (code, msg) {
    this.resp.statusCode = code;
    this.resp.send(msg);
  };

  // Get users
  Users.prototype.dbGet = function (obj, fn) {
    this.db.users.find(obj, fn);
  };

  // Set users
  Users.prototype.dbSet = function (obj, fn) {
    this.db.users.update(obj, fn);
  };

  // Create users
  Users.prototype.dbCreate = function (obj, fn) {
    this.db.users.save(obj, fn);
  };

  // Response
  Users.prototype.response = function (err, vals) {
    if (err || !vals) {
      this.send(500, "Internal Error: " + err);
    } else {
      this.send(200, vals);
    }
  };
  /**
  * Expose
  */
  return Users;

}());
