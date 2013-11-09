var GithubApi = require('github');

exports.getClient = function (accessToken) {
  var gh = new GithubApi({
    version: '3.0.0'
  });
  gh.authenticate({
    type: 'oauth',
    token: accessToken
  });
  return gh;
};

/* --------------------
// AUTH
-----------------------*/
// This will just redirect
exports.auth = function (req, res) {};

// Callback from github
exports.authCallback = function (req, res) {
  res.redirect('/');
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};
