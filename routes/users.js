var Users = require("../classes/Users.js");

// Get
exports.get = function(req, res) {
  var users = new Users(req, res);
  if (req.query.username && req.query.token) {
    users.get({
      username: req.query.username.toLowerCase(),
      token: req.query.token
    });
  } else {
    users.send(400, "Bad Request: Invalid parameters");
  }
};

// Set
exports.set = function(req, res) {
  var users = new Users(req, res);
  if (req.body.username && req.body.token) {
    users.set({
      username: req.body.username.toLowerCase(),
      token: req.body.token
    });
  } else {
    users.send(400, "Bad Request: Invalid parameters");
  }
};
