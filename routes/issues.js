var
  Issues = require("../classes/Issues.js"),
  moment = require("moment"),
  getAllRoute,
  getRoute,
  createRoute,
  updateRoute;

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

    // If number exists, run as update
    if (b.number) {
      updateRoute(req, res, config);
      return;
    }

    // Create
    if (b.repo && b.title && b.filename && b.line) {
      issues.create({
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
* Update
*
  POST
  Accepts:
  {
    repo: [string],
    line: [integer],
    filename: [string],
    line: [integer],
    state: [string]
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
exports.updateRoute = updateRoute = function(req, res, config) {
  var
    issues = new Issues(req, res),
    b = req.body,
    updateObj,
    updateProps = [
      "filename",
      "line",
      "fullLine",
      "state",
      "description",
      "username"
    ];
  if (b.repo && b.number) {
    updateObj = {
      repo: b.repo,
      number: b.number,
      dateUpdated: moment().format()
    };
    updateProps.forEach(function (val) {
      if (b[val]) {
        updateObj[val] = b[val];
      }
    });
    issues.update(updateObj, config.fn, config.silent);
  } else {
    issues.send(400, "Bad Request: Invalid parameters");
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
  getAllRoute(req, res, {
    fn: fn,
    silent: true
  });
};
exports.create = function (req, res, fn) {
  createRoute(req, res, {
    fn: fn,
    silent: true
  });
};
exports.update = function (req, res, fn) {
  updateRoute(req, res, {
    fn: fn,
    silent: true
  });
};
