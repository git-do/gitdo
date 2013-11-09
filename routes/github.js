var GithubApi = require('github');

var getClient = function (accessToken) {
  var gh = new GithubApi({
    version: '3.0.0'
  });
  return gh;
};


// This will just redirect
exports.auth = function (req, res) {};

exports.authCallback = function (req, res) {
  res.redirect('/test');
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.test = function (req, res) {
  console.log(req.user);
  res.end();
};