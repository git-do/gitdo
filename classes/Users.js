module.exports = (function () {

  /**
  * Imports
  */
  var db = require("../db.js");

  /**
  * Constructor
  */
  function Users(url) {
    this.db = db;
  }

  /**
  * Instance methods and variables
  */

  // Get users
  Users.prototype.get = function (obj, fn) {
    this.db.users.find(obj, fn);
  };

  // Set users
  Users.prototype.set = function (obj, fn) {
    this.db.users.update(obj, fn);
  };

  // Create users
  Users.prototype.create = function (obj, fn) {
    this.db.users.save(obj, fn);
  };

  /**
  * Expose
  */
  return Users;

}());
