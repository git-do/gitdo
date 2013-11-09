var
  Repos = require("../classes/Repos.js"),
  moment = require("moment");

/**
* Get
*
  GET
  Accepts:
  {
    username: [string],
    name: [string]
  }

  Returns:
  [{
    name: [string],
    dateCreated: [string],
    github: {
      id: [integer],
      fullname: [string],
      active: [boolean]
    }
  }]
*/
exports.get = function(req, res) {
  if (req.user) {
    console.log(req.user);
    var
      repos = new Repos(req, res),
      q = req.query;
    if (q.username === req.user.username && q.name) {
      repos.get({
        username: req.user.username.toLowerCase(),
        name: q.name
      });
    } else {
      repos.send(400, "Bad Request: Invalid parameters");
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
    username: [string],
    name: [string]
  }
*/
exports.create = function(req, res) {
  if (req.user) {
    var
      repos = new Repos(req, res),
      q = req.query;
    if (q.username === req.user.username && q.name) {
      repos.create({
        username: req.user.username.toLowerCase(),
        name: q.name
      });
      repos.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};
