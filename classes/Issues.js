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
        username: this.ghUser.username,
        name: obj.repo
      };
    this.originalObj = obj;
    this.callback = callback;
    this.silent = silent;

    // Check if they have access to repo
    this.dbGetRepos(dbObj, function (err, repo) {

      // If so, get issues
      self.dbGet(obj, function (err, vals) {
        self.response(err, vals, self.onGet.bind(self), true);
      });
    }, true);
  };

  // On get
  Issues.prototype.onGet = function (dbData) {
    var
      self = this,
      obj = this.originalObj,
      data;
    this.ghGet(function (err, ghData) {

      // If issues are disabled, return an empty array
      if (err && err.code === 410) {
        self.send(200, []);
      } else {
        self.response(err, ghData, function () {
          if (ghData instanceof Array === false) {
            ghData = [ghData];
          }
          data = self.mergeData(dbData, ghData);
          self.onGHGet(data);
        }, true);
      }
    }, obj.repo, obj.number);
  };

  // On gh get
  Issues.prototype.onGHGet = function (data) {

    // If number is included in request/original object,
    // it's looking for a single issue, not all issues
    if (this.originalObj.number) {
      data = data[0];
    }
    this.send(200, data);
  };

  // Create
  Issues.prototype.create = function (obj, callback, silent) {
    var
      self = this,
      dbObj = {
        username: obj.username,
        name: obj.repo
      };
    this.originalObj = obj;
    this.callback = callback;
    this.silent = silent;

    // Check if they have access to repo
    this.dbGetRepos(dbObj, function () {

      // Github
      githubIssues.createIssue(
        self.ghUser.accessToken,
        obj.repo,
        obj.username,
        obj.description,
        obj.title,
        function (err, vals) {
          self.response(err, vals, self.onGHCreate.bind(self), true);
        }
      );
    }, true);
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
        fullLine: obj.fullLine,
        dateCreated: obj.dateCreated,

        // Only use this if GH info is not available (ie. issue is closed)
        title: obj.title,
        description: obj.description,

        // From GH
        ghid: v.id,
        number: v.number,
        state: v.state
      };

    // Gitdo
    this.dbCreate(gitdoObj, function (err, vals) {
      self.response(err, vals, function () {
        vals.github = v;
        return vals;
      });
    });
  };

  // Update
  Issues.prototype.update = function (obj, callback, silent) {
    var
      self = this,
      dbObj = {
        username: obj.username,
        name: obj.repo
      };
    this.originalObj = obj;
    this.callback = callback;
    this.silent = silent;

    // Check if they have access to repo
    this.dbGetRepos(dbObj, function () {

      // If so, get issues
      self.dbUpdate(obj, function (err, val, dbObj) {
        if (!err && !dbObj.err && dbObj.ok === 1) {
          if (obj.state === 'closed') {
            githubIssues.closeIssue(
              self.ghUser.accessToken,
              obj.repo,
              obj.username,
              obj.number,
              function (err, data) {}
            );
          }
          if (obj.description) {
            githubIssues.editIssue(
              self.ghUser.accessToken,
              obj.repo,
              obj.username,
              obj.number,
              obj.description,
              function (err, data) {}
            );
          }
          self.send(200, "Success");
        }
      });
    }, true);
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
    this.db.issues.update({
      repo: obj.repo,
      number: obj.number
    }, {
      $set: obj
    }, {
      upsert: false
    }, fn);
  };

  // Create issues
  Issues.prototype.dbCreate = function (obj, fn) {
    this.db.issues.save(obj, fn);
  };

  // Get github issues
  Issues.prototype.ghGet = function (fn, repo, number) {
    if (number) {
      githubIssues.getIssue(this.ghUser.accessToken, repo, this.ghUser.username, number, fn);
    } else {
      githubIssues.getIssues(this.ghUser.accessToken, repo, this.ghUser.username, fn);
    }
  };

  // Merge data
  Issues.prototype.mergeData = function (issues, ghIssues) {
    var
      i = issues.length,
      issue,
      ghIssuesObj = this.utils.arrayToObj(ghIssues, "number");
    for (i; i; i -= 1) {
      issue = issues[i - 1];
      issue.github = ghIssuesObj[issue.number.toString()];
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
