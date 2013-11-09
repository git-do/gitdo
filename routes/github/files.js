var github = require('./github'),
    async = require('async');


var getFile = function (accessToken, repo, user, file, ref, callback) {
  var gh, content;

  gh = github.getClient(accessToken);

  gh.repos.getContent({
    'user': user,
    'repo': repo,
    'path': file,
    'ref': ref
  }, function (err, data) {
    if (err) {
      callback(err);
    } else {
      content = new Buffer(data.content, 'base64').toString('ascii');
      callback(null, content);
    }
  });
};

/* --------------------
// ROUTES
-----------------------*/
exports.getFileRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    file = req.body.user,
    ref = req.body.ref;

  if (req.user) {
    getFile(req.user.accessToken, repo, user, file, function (err, data) {
      if (err) { res.send(err); }

      res.send(data);
    });
  } else {
    res.redirect('/');
  }
};

// Exports
exports.getFile = getFile;


