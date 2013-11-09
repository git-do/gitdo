var
  Users = require("../classes/Users.js"),
  moment = require("moment");

/**
* Get
*
  GET
  {
    username: [string]
  }
*/
exports.get = function(req, res) {
  if (req.user) {
    var users = new Users(req, res);
    if (req.query.username === req.user.username) {
      users.get({
        username: req.user.username.toLowerCase()
      });
    } else {
      users.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};

/**
* Create
*
  POST
  {
    username: [string]
  }
*/
exports.create = function(req, res) {
  if (req.user) {
    var users = new Users(req, res);
    if (req.body.username === req.user.username) {
      users.create({
        username: req.user.username.toLowerCase(),
        dateCreated: moment().format()
      });
    } else {
      users.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};
