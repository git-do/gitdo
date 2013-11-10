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
  Parser.prototype.parseCode = function (filename, code) {
    this.allGitDos(filename, code); // Get a list of all gitdos
    this.checkDeleted(code);
  };

  Parser.prototype.allGitDos = function (filename, code) {
    var
      self = this,
      comments = code.match(this.commentRegex),
      lines = code.split('\n');

    for (var i = 0; i < comments.length; i++) {
      var gitdo = {};

      if (comments[i].match(self.gitdoRegex)) {
        gitdo.filename = filename;
        gitdo.block = comments[i];
        gitdo.line = comments[i].match(self.gitdoRegex)[0];
        gitdo.issue = comments[i].match(self.gitdoRegex)[0].replace(self.cleanupRegex, '').replace(self.gitdoRegex, '$2');
        self.getLineNum(gitdo.line, lines, function (num) {
          gitdo.lineNum = num;
          var saved = self.getSaved();
          self.compare(gitdo, saved);
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
      if (item.line === gitdo.line) {
        found = true;
        if (item.lineNum !== gitdo.lineNum) {
          // Update linenum
          item.lineNum = gitdo.lineNum;
        }
      }
      callback(found);
    }, function (found) {
      if (!found) {
        // Add to our database and create a github issue
        console.log(gitdo);
      }
    });
  };

  // Check to see if we have deleted gitdos
  Parser.prototype.checkDeleted = function (code) {
    var saved = this.getSaved();
    async.each(saved, function (gitdo, callback) {
      if (code.indexOf(gitdo.line) === -1) {
        // REMOVE GITDO!!!
        console.log('I am removed.');
        console.log(gitdo);
      }
      callback();
    });
  };

  Parser.prototype.getSaved = function () {
    return [{
        filename: 'test.js',
        block: '/* This is a test JS file\n @todo: something */',
        line: '  @todo: something */',
        issue: 'something ',
        lineNum: 2
      },
      {
        filename: 'test.js',
        block: '// @todo: asdfasdff',
        line: '// @todo: asdfasdff',
        issue: 'asdfasdff',
        lineNum: 7
      },
      {
        filename: 'test.js',
        block: '// @todo: ALL THINGS',
        line: '// @todo: ALL THINGS',
        issue: 'ALL THINGS',
        lineNum: 9
      }];
  };

  return Parser;
})();