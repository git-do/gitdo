module.exports = (function () {

  /**
  * Imports
  */
  var async = require('async'),
      Issues = require('./Issues');

  /**
  * Constructor
  */
  function Parser() {
    this.gitdoRegex = /(.*\@todo: (.*))/gi;
    this.commentRegex = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
    this.cleanupRegex = /\/\/|\/\*|\*\//gi;
  }

  // Parse code
  // Shoving most of the issue handling stuff in here, because it's faster ... @TODO: Please, refactor.
  Parser.prototype.parseCode = function (filename, repo, user, code) {
    this.allGitDos(filename, repo, user, code); // Get a list of all gitdos
    this.checkDeleted(repo, code);
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
          self.compare(repo, gitdo);
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
  Parser.prototype.compare = function (repo, gitdo) {
    this.getSaved(repo, function (saved) {
      async.each(saved, function (item, callback) {
        var found = false;

        if (item.filename === gitdo.filename && item.fullLine === gitdo.fullLine) {
          found = true;
          if (item.line !== gitdo.line) {
            // Update linenum
            item.line = gitdo.line;
          }
        }
        callback(found);
      }, function (found) {
        if (!found) {
          // Add to our database and create a github issue
          var request = {
            user: {
              username: 'gitdo',
              accessToken: 'eca89c2aa0c1e8fd867efb6da061792400c6efdd'
            }
          };

          var response = {
            send: function () {}
          };

          var issues = new Issues(request, response);
          issues.create(gitdo, function () {}, false);
        }
      });
    });

  };

  // Check to see if we have deleted gitdos
  Parser.prototype.checkDeleted = function (repo, code) {
    var lines = code.split('\n');

    this.getSaved(repo, function (saved) {
      async.each(saved, function (gitdo, callback) {
        var index = code.indexOf(gitdo.fullLine);

        if (index === -1 || code.substr(index).split('\n')[0] !== gitdo.fullLine) {
          // REMOVE GITDO!!!

        }
        callback();
      });
    });
  };

  Parser.prototype.getSaved = function (repo, callback) {
    var request = {
      user: {
        username: 'gitdo',
        accessToken: 'eca89c2aa0c1e8fd867efb6da061792400c6efdd'
      }
    };

    var response = {
      send: function (code, data) {  }
    };

    var issues = new Issues(request, response);
    issues.get({ repo: repo }, function (data) {
      callback(data);
    }, false);

  };

  return Parser;
})();