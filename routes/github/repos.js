var github = require('./github'),
    async = require('async');

/* --------------------
// GITHUB API
-----------------------*/

// Get all repos
var getRepos = function (accessToken, callback) {
  var
    repos = [],
    gh;

  gh = github.getClient(accessToken);

  gh.repos.getAll({
    'type': 'public'
  }, function (err, data) {
    if (err) { 
      callback(err); 
    } else {
      async.each(data, function (repo, cb) {
        // TODO: check to see if the repo is activated
        var newRepo = {
          'id': repo['id'],
          'fullname': repo['full_name'],
          'active': false
        };
        repos.push(newRepo);
        // Save these to database
        cb();
      }, function () {
        callback(null, repos);
      });
    }
  });

};

// Get specific repo
var getRepo = function (accessToken, repo, user, callback) {
  var gh;

  gh = github.getClient(accessToken);

  gh.repo.get({
    'user': user,
    'repo': repo
  }, function (err, data) {
    if (err) { 
      callback(err); 
    } else {
      callback(null, data);  
    }
  });

};

// Routes
exports.getReposRoute = function (req, res) {
  if (req.user) {
    getRepos(req.user.accessToken, function (err, data) {
      if (err) { res.send(err); }
      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};

exports.getRepoRoute = function (req, res) {
  if (req.user) {
    getRepo(req.user.accessToken, repo, user, function (err, data) {
      if (err) { res.send(err); }
      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};

// Exports
exports.getRepos = getRepos;
exports.getRepo = getRepo;
