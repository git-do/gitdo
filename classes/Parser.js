module.exports = (function () {

  /**
  * Imports
  */
  var async = require('async');

  /**
  * Constructor
  */
  function Parser() {
    this.gitdoRegex = /(.*\@todo: (.*))/gi;
    this.commentRegex = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
    this.cleanupRegex = /\/\/|\/\*|\*\//gi;
  }

  // Parse code
  Parser.prototype.parseCode = function (filename, repo, user, code) {
    this.allGitDos(filename, repo, user, code); // Get a list of all gitdos
    this.checkDeleted(code);
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
        gitdo.description = comments[i];
        gitdo.fullLine = comments[i].match(self.gitdoRegex)[0];
        // gitdo.fullLine = comments[i].replace(self.gitdoRegex, '$1');
        gitdo.username = user;
        gitdo.repo = repo;
        gitdo.title = comments[i].match(self.gitdoRegex)[0].replace(self.cleanupRegex, '').replace(self.gitdoRegex, '$2');
        self.getLineNum(gitdo.fullLine, lines, function (num) {
          gitdo.line = num;
          var saved = self.getSaved();
          self.compare(gitdo, saved);
          // console.log(gitdo);
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
  Parser.prototype.compare = function (gitdo, saved) {
    async.each(saved, function (item, callback) {
      var found = false;
      if (item.fullLine === gitdo.fullLine) {
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
        // console.log(gitdo);
      }
    });
  };

  // Check to see if we have deleted gitdos
  Parser.prototype.checkDeleted = function (code) {
    var saved = this.getSaved(),
        lines = code.split('\n');

    async.each(saved, function (gitdo, callback) {
      var index = code.indexOf(gitdo.fullLine);

      if (index === -1 || code.substr(index).split('\n')[0] !== gitdo.fullLine) {
        // REMOVE GITDO!!!
        console.log('I am removed.');
        console.log(gitdo);
      }
      callback();
    });
  };

  Parser.prototype.getSaved = function () {
    return [{ filename: 'test.js',
        description: '/* This is a test JS file\n  @todo: something */',
        fullLine: '  @todo: something */',
        username: 'gitdo',
        repo: 'todo',
        title: 'something ',
        line: 2 },
      { filename: 'test.js',
        description: '// @todo: asdfasdff',
        fullLine: '// @todo: asdfasdff',
        username: 'gitdo',
        repo: 'todo',
        title: 'asdfasdff',
        line: 7 },
      { filename: 'test.js',
        description: '// @todo: ALL THINGSSz',
        fullLine: '// @todo: ALL THINGSSz',
        username: 'gitdo',
        repo: 'todo',
        title: 'ALL THINGSSz',
        line: 9 }];
  };

  return Parser;
})();