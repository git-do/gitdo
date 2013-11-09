var GetUser = (function () {

  /**
  * Imports
  */
  var Users = require("../classes/Users.js");

  /**
  * Constructor
  */
  function GetUser(req, res) {
    this.req = req;
    this.res = res;
    this.users = new Users();
    this.body = req.body;
  }

  /**
  * Instance methods and properties
  */

  // Get
  GetUser.prototype.get = function () {
    var self = this;
    return this.users.get({
      username: this.body.username
    }, function (err, vals) {
      if (err || !vals) {
        self.send(500, "Internal Error: " + err);
      } else {
        self.send(200, "Success");
      }
    });
  };

  // Send
  GetUser.prototype.send = function (code, msg) {
    this.resp.statusCode = code;
    this.resp.send(msg);
  };

  /**
  * Expose
  */
  return GetUser;
}());

exports.getUser = function(req, res) {
  var getUser = new GetUser(req, res);
  if (getUser.body.username) {
    getUser.get();
  } else {
    getUser.send(400, "Bad Request: Invalid parameters");
  }
};
