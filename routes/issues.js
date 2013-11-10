var
  Issues = require("../classes/Issues.js"),
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
    repo: [string]
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
exports.getAllRoute = getAllRoute = function(req, res, config) {
  if (req.user) {
    var
      issues = new Issues(req, res),
      q = req.query;
    if (q.repo) {
      issues.get({
        repo: q.repo
      }, config.fn, config.silent);
    } else {
      issues.send(400, "Bad Request: Invalid parameters");
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
    number: [string],
    repo: [string]
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
exports.getRoute = function(req, res, config) {
  if (req.user) {
    var
      issues = new Issues(req, res),
      q = req.query;
    if (q.number && q.repo) {
      issues.get({
        number: parseInt(q.number, 10),
        repo: q.repo
      }, config.fn, config.silent);
    } else {
      issues.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};

/**
* Create
*
  POST
  Accepts:
  {
    username: [string],
    repo: [string],
    title: [string],
    description: [string],
    filename: [string],
    line: [integer]
  }

  Returns:
  {
    "repo": [string],
    "filename": [string],
    "line": [integer],
    "dateCreated": [string],
    "ghid": [integer],
    "number": [integer],
    "_id": [string]
  }
*/
exports.createRoute = createRoute = function(req, res, config) {
  if (req.user) {
    var
      issues = new Issues(req, res),
      b = req.body;
    if (b.username === req.user.username && b.repo && b.title && b.filename && b.line) {
      issues.create({
        username: req.user.username.toLowerCase(),
        repo: b.repo,
        title: b.title,
        description: b.description || "No description",
        filename: b.filename,
        line: b.line,
        dateCreated: moment().format()
      }, config.fn, config.silent);
    } else {
      issues.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};

/**
* Close
*
  DELETE
  Accepts
  {
    username: [string],
    number: [string],
    repo: [string]
  }
*/
/*exports.closeRoute = function(req, res, config) {
  if (req.user) {
    var
      issues = new Issues(req, res),
      p = req.params;
    if (p.name && ) {
      issues.delete({
        username: req.user.username.toLowerCase(),
        name: p.name
      }, config.fn, config.silent);
    } else {
      issues.send(400, "Bad Request: Invalid parameters");
    }
  } else {
    res.redirect("/");
  }
};*/

/**
* Server connectors
*/
exports.getAll = function (req, res, fn) {
  req.query = req.query || {};
  req.query.username = req.user.username;
  getAllRoute(req, res, {
    fn: fn,
    silent: true
  });
};
exports.create = function (req, res, fn) {
  req.query = req.query || {};
  req.query.username = req.user.username;
  createRoute(req, res, {
    fn: fn,
    silent: true
  });
};
