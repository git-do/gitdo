module.exports = (function () {

  /**
  * Imports
  */
  var
    db = require("../db.js"),
    Utils = require("./Utils.js"),
    githubRepos = require("../routes/github/repos.js");

  /**
  * Constructor
  */
  function Repos(req, resp) {
    this.utils = new Utils();
    this.db = db;
    this.ghUser = req.user;
    this.req = req;
    this.resp = resp;
  }

  /**
  * Instance methods and variables
  */

  // Get
  Repos.prototype.get = function (obj) {
    var self = this;
    this.originalObj = obj;
    this.dbGet(obj, function (err, vals) {
      self.response(err, vals, function (v) {
        self.onGet(v);
      }, true);
    });
  };

  // On get
  Repos.prototype.onGet = function (vals) {
    var
      self = this,
      data;
    this.ghGet(function (err, ghData) {
      if (err || !ghData) {
        self.send(500, "Internal Error: " + err);
      } else {
        data = self.mergeData(vals, ghData);

        // If name is included in request/original object,
        // it's looking for a single repo, not all repos
        if (self.originalObj.name) {
          data = data[0];
        }
        self.send(200, data);
      }
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

  // Get github repos
  Repos.prototype.ghGet = function (fn) {
    githubRepos.getRepos(this.ghUser.accessToken, fn);
  };

  // Merge data
  Repos.prototype.mergeData = function (repos, ghRepos) {
    var
      i = repos.length,
      repo,
      ghReposObj = this.utils.arrayToObj(ghRepos, "id");
    for (i; i; i -= 1) {
      repo = repos[i - 1];
      repo.github = ghReposObj[repo.ghid.toString()];
    }
    return repos;
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
