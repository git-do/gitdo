module.exports = (function () {

  /**
  * Imports
  */
  var async = require('async'),
      files = require('../routes/github/files');

  /**
  * Constructor
  */
  function Parser() {
    this.gitdoRegex = /(.*\@todo: (.*))/gi;
    this.commentRegex = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
    this.cleanupRegex = /\/\/|\/\*|\*\//gi;
  }

  // Parse code
  Parser.prototype.parseCode = function (code) {
    var
      self = this,
      comments = code.match(this.commentRegex),
      lines = code.split('\n');
  
    for (var i = 0; i < comments.length; i++) {
      var gitdo = {};

      if (comments[i].match(self.gitdoRegex)) {
        gitdo.block = comments[i];
        gitdo.line = comments[i].match(self.gitdoRegex)[0];
        gitdo.issue = comments[i].match(self.gitdoRegex)[0].replace(self.cleanupRegex, '').replace(self.gitdoRegex, '$2');
        self.getLineNum(gitdo.line, lines, function (num) {
          gitdo.lineNum = num;
          console.log(gitdo);
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

  return Parser;
})();