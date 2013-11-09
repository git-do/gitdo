var github = require('./github'),
    async = require('async');

// Create issue
var createIssue = function (accessToken, repo, user, desc, title, callback) {
  var gh;

  gh = github.getClient(accessToken);

  gh.issues.create({
    'user': user,
    'repo': repo,
    'body': desc,
    'title': title,
    'labels': ['bug']
  }, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });

};

// Get issue
var getIssue = function (accessToken, repo, user, number, callback) {
  var gh;

  gh = github.getClient(accessToken);

  gh.issues.getRepoIssue({
    'user': user,
    'repo': repo,
    'number': number
  }, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
};

var closeIssue = function (accessToken, repo, user, number, callback) {
  var gh;

  gh = github.getClient(accessToken);

  gh.issues.edit({
    'user': user,
    'repo': repo,
    'number': number,
    'state': 'closed'
  }, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
};


// Routes
exports.createIssueRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    desc = req.body.desc,
    title = req.body.title;

  if (req.user) {
    createIssue(req.user.accessToken, repo, user, desc, title, function (err, data) {
      if (err) { res.send(err); }
      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};

exports.getIssueRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    number = req.body.number;

  if (req.user) {
    getIssue(req.user.accessToken, repo, user, number, function (err, data) {
      if (err) { res.send(err); }
      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};

exports.closeIssueRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    number = req.body.number;
  if (req.user) {
    closeIssue(req.user.accessToken, repo, user, number, function (err, data) {
      if (err) { res.send(err); }
      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};

// Exports
exports.createIssue = createIssue;
exports.getIssue = getIssue;
exports.closeIssue = closeIssue;