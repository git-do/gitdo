var github = require('./github'),
    async = require('async'),
    files = require('./files'),
    Issues = require('../../classes/Issues'),
    Parser = require('../../classes/Parser');

var HOOK_URL = 'http://meltmedia.2013.nodeknockout.com/api/commit';

var newHook = {
  'name': 'web',
  'active': true,
  'events': [
    'push'
  ],
  'config': {
    'url': HOOK_URL
  }
};

var addHook = function (accessToken, repo, user, callback) {
  var data = newHook,
      gh;

  data.user = user;
  data.repo = repo;

  gh = github.getClient(accessToken);

  gh.repos.createHook(data, function (err) {
    callback(err);
  });

};

var removeHook = function (accessToken, repo, user, callback) {
  var gh;
  gh = github.getClient(accessToken);

  gh.repos.getHooks({
    'user': user,
    'repo': repo
  }, function (err, data) {
    if (err) {
      callback(err);
    } else {
      async.each(data, function (hook, cb) {
        if (hook.config.url === HOOK_URL) {
          gh.repos.deleteHook({
            'user': user,
            'repo': repo,
            'id': hook.id
          });
        }
        cb();
      }, function () {
        callback();
      });
    }
  });
};


// Add web hook to a repo
exports.addHookRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0];

  if (req.user) {
    addHook(req.user.accessToken, repo, user, function (err) {
      if (err) { res.send(err); }
      res.send('Hook Created');
    });
  } else {
    res.redirect('/');
  }

};

// Remove web hook from repo
exports.removeHookRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0];

  if (req.user) {
    removeHook(req.user.accessToken, repo, user, function (err) {
      if (err) { res.send(err); }
      res.send('Hook removed');
    });
  } else {
    res.redirect('/');
  }
};

// Web hook listener
exports.webHook = function (req, res) {
  var payload = JSON.parse(req.body.payload),
      payloadInfo = {};

  payloadInfo.repo = payload.repository.name;
  payloadInfo.user = payload.repository.owner.name;
  payloadInfo.ref = payload.ref;
  payloadInfo.changedFiles = [];

  async.each(payload.commits, function (commit, callback) {
    payloadInfo.changedFiles = payloadInfo.changedFiles.concat(commit.added);
    payloadInfo.changedFiles = payloadInfo.changedFiles.concat(commit.modified);
    callback();
  }, function () {

    // Remove duplicates
    payloadInfo.changedFiles = payloadInfo.changedFiles.filter(function (elem, pos) {
      return payloadInfo.changedFiles.indexOf(elem) === pos;
    });

    // todo: give these files to the parser
    var parser = new Parser();
    async.each(payloadInfo.changedFiles, function (item, callback) {
      // Get the user's access token
      var accessToken = 'eca89c2aa0c1e8fd867efb6da061792400c6efdd';

      files.getFile(accessToken, payloadInfo.repo, payloadInfo.user, item, payloadInfo.ref, function (err, data) {
        parser.parseCode(item, payloadInfo.repo, payloadInfo.user, data); // This will parse the code and create gitdos
      });
    });

  });

  res.end();
};

exports.addHook = addHook;
exports.removeHook = removeHook;