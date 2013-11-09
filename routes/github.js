exports.auth = function (req, res) {
  
};

exports.authCallback = function (req, res) {
  res.redirect('/test');
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.test = function (req, res) {
  res.end();
};