var github = require('./github'),
    async = require('async');

// Create issue
exports.createIssue = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    body = req.body.desc,
    title = req.body.title,
    gh;

  if (req.user) {
    gh = github.getClient(req.user.accessToken);

    gh.issues.create({
      'user': user,
      'repo': repo,
      'body': body,
      'title': title,
      'labels': ['bug']
    }, function (err, data) {
      if (err) { res.send(err); }
      console.log(err);
      console.log(data);
      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};

// Get issue
exports.getIssue = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    number = req.body.number,
    gh;

  if (req.user) {
    gh = github.getClient(req.user.accessToken);

    gh.issues.getRepoIssue({
      'user': user,
      'repo': repo,
      'number': number
    }, function (err, data) {
      if (err) { res.send(err); }

      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};