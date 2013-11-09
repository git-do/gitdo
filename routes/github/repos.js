var github = require('./github'),
    async = require('async');

/* --------------------
// GITHUB API
-----------------------*/

// Get all repos
exports.getRepos = function (req, res) {
  var
    repos = [],
    gh;

  if (req.user) {
    gh = github.getClient(req.user.accessToken);

    gh.repos.getAll({
      'type': 'public'
    }, function (err, data) {
      if (err) { res.send(err); }

      async.each(data, function (repo, callback) {
        // TODO: check to see if the repo is activated
        var newRepo = {
          'id': repo['id'],
          'fullname': repo['full_name'],
          'active': false
        };
        repos.push(newRepo);
        // Save these to database
        callback();
      }, function () {
        res.send(repos);
      });

    });

  } else {
    res.redirect('/');
  }

};

// Get specific repo
exports.getRepo = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    gh;

  if (req.user) {
    gh = github.getClient(req.user.accessToken);

    gh.repo.get({
      'user': user,
      'repo': repo
    }, function (err, data) {
      if (err) { console.log(err); res.send(err); }

      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};
