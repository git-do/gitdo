var
  Repos = require("../classes/Repos.js"),
  moment = require("moment"),
  getAllRoute,
  getRoute,
  createRoute;

/**
* Get all
*
  GET
  Accepts:
  {
    username: [string]
  }

  Returns:
  [{
    "_id": [string],
    "ghid": [integer],
    "name": [string],
    "username": [string],
    "github": {
      "id": [integer],
      "fullname": [string],
      "active": [boolean]
    }
  }]
*/
exports.getAllRoute = getAllRoute = function(req, res, fn, silent) {
  if (req.user) {
    var
      repos = new Repos(req, res),
      q = req.query;
    if (q.username === req.user.username) {
      repos.get({
        username: req.user.username.toLowerCase()
      }, fn, silent);
    } else {
      repos.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};

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
  {
    "_id": [string],
    "ghid": [integer],
    "name": [string],
    "username": [string],
    "github": {
      "id": [integer],
      "fullname": [string],
      "active": [boolean]
    }
  }
*/
exports.getRoute = function(req, res, fn, silent) {
  if (req.user) {
    var
      repos = new Repos(req, res),
      q = req.query;
    if (q.username === req.user.username && q.name) {
      repos.get({
        username: req.user.username.toLowerCase(),
        name: q.name
      }, fn, silent);
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
  Accepts
  {
    username: [string],
    name: [string]
  }
*/
exports.createRoute = function(req, res, fn, silent) {
  if (req.user) {
    var
      repos = new Repos(req, res),
      b = req.body;
    if (b.username === req.user.username && b.name) {
      repos.create({
        username: req.user.username.toLowerCase(),
        name: b.name,
        dateCreated: moment().format()
      }, fn, silent);
    } else {
      repos.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};

/**
* Server connectors
*/
exports.getAll = function (req, res, fn) {
  req.query = req.query || {};
  req.query.username = req.user.username;
  getAllRoute(req, res, fn, true);
};
