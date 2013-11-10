module.exports = (function () {

  /**
  * Imports
  */
  var
    db = require("../db.js"),
    Utils = require("./Utils.js"),
    githubIssues = require("../routes/github/issues.js");

  /**
  * Constructor
  */
  function Issues(req, resp) {
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
  Issues.prototype.get = function (obj, callback, silent) {
    var
      self = this,
      dbObj = {
        username: this.ghUser.user,
        name: obj.repo
      };
    this.originalObj = obj;
    this.callback = callback;
    this.silent = silent;

    // Check if they have access to repo
    this.dbGetRepos(dbObj, function () {

      // If so, get issues
      self.dbGet(obj, function (err, vals) {
        self.response(err, vals, self.onGet.bind(self), true);
      });
    }, true);
  };

  // On get
  Issues.prototype.onGet = function (data) {

    // If number is included in request/original object,
    // it's looking for a single issue, not all issues
    if (this.originalObj.number) {
      data = data[0];
    }
    this.send(200, data);
  };

  // Create
  Issues.prototype.create = function (obj, callback, silent) {
    var self = this;
    this.originalObj = obj;
    this.callback = callback;
    this.silent = silent;

    // Github
    githubIssues.createIssue(
      this.ghUser.accessToken,
      obj.repo,
      obj.username,
      obj.description,
      obj.title,
      function (err, vals) {
        self.response(err, vals, self.onGHCreate.bind(self), true);
      }
    );
  };

  // On gh create
  Issues.prototype.onGHCreate = function (v) {
    var
      self = this,
      obj = this.originalObj,
      gitdoObj = {
        repo: obj.repo,
        filename: obj.filename,
        line: obj.line,
        dateCreated: obj.dateCreated,
        
        // From GH
        ghid: v.id,
        number: v.number
      };

    // Gitdo
    this.dbCreate(gitdoObj, this.response.bind(this));
  };

  // Delete
  Issues.prototype.delete = function (obj, callback, silent) {
    var self = this;
    this.originalObj = obj;
    this.callback = callback;
    this.silent = silent;

    this.dbDelete(obj, this.response.bind(this));
  };

  // Send
  Issues.prototype.send = function (code, msg) {

    // This is silly. @TODO: figure out what 1 unknown is
    if (msg === 1) {
      msg = "Success";
    }

    if (!this.silent) {
      this.resp.statusCode = code;
      this.resp.send(msg);
    } else {
    }
    if (typeof this.callback === "function") {
      this.callback(msg);
    }
  };

  // Get issues
  Issues.prototype.dbGet = function (obj, fn) {
    this.db.issues.find(obj, fn);
  };

  // Get repos
  Issues.prototype.dbGetRepos = function (obj, fn) {
    this.db.repos.find(obj, fn);
  };

  // Delete issues
  Issues.prototype.dbDelete = function (obj, fn) {
    this.db.issues.remove(obj, fn);
  };

  // Update issues
  Issues.prototype.dbUpdate = function (obj, fn) {
    this.db.issues.update(obj, fn);
  };

  // Create issues
  Issues.prototype.dbCreate = function (obj, fn) {
    this.db.issues.save(obj, fn);
  };

  // Get github issues
  Issues.prototype.ghGet = function (fn, repo) {
      githubIssues.getIssue(this.ghUser.accessToken, repo, this.originalObj.username, fn);
  };

  // Merge data
  Issues.prototype.mergeData = function (issues, ghIssues) {
    var
      i = issues.length,
      repo,
      ghIssuesObj = this.utils.arrayToObj(ghIssues, "id");
    for (i; i; i -= 1) {
      repo = issues[i - 1];
      repo.github = ghIssuesObj[repo.ghid.toString()];
    }
    return issues;
  };

  // Response
  Issues.prototype.response = function (err, vals, fn, replaceFn) {
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
  return Issues;

}());
