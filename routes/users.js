var
  Users = require("../classes/Users.js"),
  moment = require("moment"),
  get,
  create;

/**
* Get
*
  GET
  {
    username: [string]
  }
*/
exports.get = get = function(req, res, config) {
  if (req.user) {
    var users = new Users(req, res);
    users.get({
      username: req.user.username.toLowerCase()
    }, config.fn, config.silent);
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
exports.create = create = function(req, res, config) {
  if (req.user) {
    var users = new Users(req, res);
    if (req.body.username === req.user.username) {
      users.create({
        username: req.user.username.toLowerCase(),
        dateCreated: moment().format()
      }, config.fn, config.silent);
    } else {
      users.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};
exports.add = function (req, res) {

  // Check to see if user exists
  get(req, res, {
    silent: true,
    fn: function (data) {

      // If user does not exist
      if (data instanceof Array && !data.length) {
        req.body = req.body || {};
        req.body.username = req.user.username;
        create(req, res, {
          silent: true,
          fn: function () {
          }
        });
      }
    }
  });
};
