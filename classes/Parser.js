module.exports = (function () {

  /**
  * Imports
  */
  var async = require('async'),
      Issues = require('./Issues'),
      issuesRoute = require('../routes/issues');

  /**
  * Constructor
  */
  function Parser() {
    this.gitdoRegex = /(.*\@todo: (.*))/gi;
    this.commentRegex = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
    this.cleanupRegex = /\/\/|\/\*|\*\//gi;

    this.request = {
      user: {
        username: 'gitdo',
        accessToken: 'eca89c2aa0c1e8fd867efb6da061792400c6efdd'
      }
    };

    this.response =  {
      send: function () {}
    };

  }

  // Parse code
  // Shoving most of the issue handling stuff in here, because it's faster ... @TODO: Please, refactor.
  Parser.prototype.parseCode = function (filename, repo, user, code) {
    this.allGitDos(filename, repo, user, code); // Get a list of all gitdos
    this.checkDeleted(repo, user, code);
  };

  Parser.prototype.allGitDos = function (filename, repo, user, code) {
    var
      self = this,
      comments = code.match(this.commentRegex),
      lines = code.split('\n');

    for (var i = 0; i < comments.length; i++) {
      var gitdo = {};

      if (comments[i].match(self.gitdoRegex)) {
        gitdo.filename = filename;
        gitdo.fullLine = comments[i].match(self.gitdoRegex)[0];
        gitdo.username = user;
        gitdo.repo = repo;
        gitdo.title = comments[i].match(self.gitdoRegex)[0].replace(self.cleanupRegex, '').replace(self.gitdoRegex, '$2');
        self.getLineNum(gitdo.fullLine, lines, function (num) {
          gitdo.line = num;
          gitdo.description = gitdo.filename + ' - Line ' + gitdo.line + '\n```' + comments[i] + '```';
          self.compare(repo, user, gitdo);
        });
      }
    }
  };

  // Get line number
  Parser.prototype.getLineNum = function (item, lines, callback) {
    async.each(lines, function (line, cb) {
      if (line.indexOf(item) > -1) {
        callback(lines.indexOf(line) + 1);
      } else {
        cb();
      }
    }, function (num) {
      callback(num);
    });
  };

  // Compare existing gitdos
  Parser.prototype.compare = function (repo, user, gitdo) {
    var self = this;

    this.getSaved(repo, user, function (saved) {
      async.each(saved, function (item, callback) {
        var found = false;
        if (item.filename === gitdo.filename && item.fullLine === gitdo.fullLine) {
          found = true;
          if (item.line !== gitdo.line) {
            // Update linenum
            var request = self.request;
            request.body = {
              'repo': item.repo,
              'username': user,
              'number': item.number,
              'line': gitdo.line,
              'description': gitdo.description
            };

            issuesRoute.update(request, self.response, function () {});
          }

          // Spooky ghost
          if (item.state === 'closed') {
            var request = self.request;
            request.body = {
              'repo': item.repo,
              'username': user,
              'number': item.number,
              'state': 'ghost'
            };

            issuesRoute.update(request, self.response, function () {});
          }
        }
        callback(found);
      }, function (found) {
        if (!found) {
          // Add to our database and create a github issue
          var issues = new Issues(self.request, self.response);
          issues.create(gitdo, function () {}, false);
        }
      });
    });

  };

  // Check to see if we have deleted gitdos
  Parser.prototype.checkDeleted = function (repo, user, code) {
    var lines = code.split('\n'),
        self = this;

    this.getSaved(repo, user, function (saved) {
      async.each(saved, function (gitdo, callback) {
        var index = code.indexOf(gitdo.fullLine);

        if (index === -1 || code.substr(index).split('\n')[0] !== gitdo.fullLine) {
          // close
          var request = self.request;
          request.body = {
            'repo': gitdo.repo,
            'username': user,
            'number': gitdo.number,
            'state': 'closed'
          };

          issuesRoute.update(request, self.response, function () {});
        }
        callback();
      });
    });
  };

  Parser.prototype.getSaved = function (repo, user, callback) {
    var issues = new Issues(this.request, this.response);
    issues.get({ repo: repo, username: user }, function (data) {
      callback(data);
    }, false);
  };

  return Parser;
})();