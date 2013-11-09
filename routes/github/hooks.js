var github = require('./github'),
    async = require('async'),
    files = require('./files'),
    Parser = require('../../classes/Parser');

var HOOK_URL = 'http://meltmedia.2013.nodeknockout.com/api/commit';

var newHook = {
  'name': 'web',
  'active': true,
  'events': [
    'push'
  ],
  'config': {
    'url': HOOK_URL,
    'content_type': 'json'
  }
};

// Add web hook to a repo
exports.addHookRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    gh;

  var data = newHook;
  data.user = user;
  data.repo = repo;

  if (req.user) {
    gh = github.getClient(req.user.accessToken);

    gh.repos.createHook(data, function (err) {
      res.send(err);
    });
  } else {
    res.redirect('/');
  }
};

// Remove web hook from repo
exports.removeHookRoute = function (req, res) {
  var
    repo = req.body.repo.split('/')[1],
    user = req.body.repo.split('/')[0],
    gh;

  if (req.user) {
    gh = github.getClient(req.user.accessToken);

    gh.repos.getHooks({
      'user': user,
      'repo': repo
    }, function (err, data) {
      if (err) { res.send(err); }

      async.each(data, function (hook, callback) {
        if (hook.config.url === HOOK_URL) {
          gh.repos.deleteHook({
            'user': user,
            'repo': repo,
            'id': hook.id
          });
        }
        callback();
      }, function () {
        res.send('Removed Hook');
      });
    });
  } else {
    res.redirect('/');
  }
};

// Web hook listener
exports.webHook = function (req, res) {
  var payload = req.body.payload,
      payloadInfo = {};

  payloadInfo.repo = payload.repository.name;
  payloadInfo.user = payload.repository.owner.name;
  payloadInfo.ref = payload.ref;
  payloadInfo.changedFiles = [];

  async.each(payload.commits, function (commit, callback) {
    payloadInfo.changedFiles = payloadInfo.changedFiles.concat(commit.added);
    payloadInfo.changedFiles = payloadInfo.changedFiles.concat(commit.modified);
    payloadInfo.changedFiles = payloadInfo.changedFiles.concat(commit.removed);
    callback();
  }, function () {
    // Remove duplicates
    payloadInfo.changedFiles = payloadInfo.changedFiles.filter(function (elem, pos) {
      return payloadInfo.changedFiles.indexOf(elem) === pos;
    });

    // todo: give these files to the parser
    var parser = new Parser();
    files.getFile('eca89c2aa0c1e8fd867efb6da061792400c6efdd', payloadInfo.repo, payloadInfo.user, payloadInfo.changedFiles[0], payloadInfo.ref, function (err, data) {
      parser.parseCode(data);
    });
  });

  res.end();
};