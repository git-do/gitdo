module.exports = (function () {

  /**
  * Imports
  */
  var
    db = require("../db.js"),
    githubRepos = require("github/repos.js");

  /**
  * Constructor
  */
  function Repos(req, resp) {
    this.db = db;
    this.gh = req.user;
    this.req = req;
    this.resp = resp;
  }

  /**
  * Instance methods and variables
  */

  // Get
  Repos.prototype.get = function (obj) {
    var self = this;
    this.dbGet(obj, function (err, vals) {
      self.response(err, vals);
    });
  };

  // Create
  Repos.prototype.create = function (obj) {
    var self = this;
    this.dbGet({
      username: obj.username,
      name: obj.name
    }, function (e, v) {
      if (!e && v && !v.length) {
        self.dbCreate(obj, function (err, vals) {
          self.response(err, vals);
        });
      } else {
          self.send(409, "Conflict: Username exists");
      }
    });
  };

  // Send
  Repos.prototype.send = function (code, msg) {
    this.resp.statusCode = code;
    this.resp.send(msg);
  };

  // Get repos
  Repos.prototype.dbGet = function (obj, fn) {
    this.db.repos.find(obj, fn);
  };

  // Update repos
  Repos.prototype.dbUpdate = function (obj, fn) {
    this.db.repos.update(obj, fn);
  };

  // Create repos
  Repos.prototype.dbCreate = function (obj, fn) {
    this.db.repos.save(obj, fn);
  };

  // Response
  Repos.prototype.response = function (err, vals, fn, replaceFn) {
    if (err || !vals) {
      this.send(500, "Internal Error: " + err);
    } else {
      if (replaceFn) {
        fn(vals);
      } else {
        this.send(200, fn ? fn(vals) : vals);
      }
    }
  };
  /**
  * Expose
  */
  return Repos;

}());
