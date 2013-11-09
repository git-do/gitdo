
/**
 * Module dependencies.
 */

var
  express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  sass = require('node-sass'),
  ejs = require('ejs'),
  passport = require('passport'),
  GithubStrat = require('passport-github').Strategy;

var isProduction = (process.env.NODE_ENV === 'production');

/* --------------------
// GITHUB SETUP
-----------------------*/
var GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET; // "Ignore Security"

if (!isProduction) {
  GITHUB_CLIENT_ID = "546f4d5ead70fc95aa41";
  GITHUB_CLIENT_SECRET = "1ddaecee7d8acdb427bb775ec9f8acf312609700"; // "Ignore Security"
} else {
  GITHUB_CLIENT_ID = "edf9b749ff3da8d37514";
  GITHUB_CLIENT_SECRET = "3ec13feb29ff46146a7d820c8686fb7be2102f5d";
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new GithubStrat({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    scope: 'public_repo'
  }, function (accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    done(null, profile);
  }
));

var app = express();

var port = (isProduction ? 80 : 3000);

// development only
if (!isProduction) {
  app.use(express.errorHandler());
  app.use(
    sass.middleware({
      src: __dirname,
      dest: __dirname + '/public',
      debug: true
    })
  );
}



/* --------------------
// EXPRESS SETUP
-----------------------*/
app.set('port', process.env.PORT || port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({ secret: 'IgnoreSecurity!' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);


var github = require('./routes/github/github'),
    repos = require('./routes/github/repos'),
    users = require('./routes/users'),
    issues = require('./routes/github/issues'),
    hooks = require('./routes/github/hooks');

// Views
app.get('/', function (req, res) {
  res.render('index', { title: 'The index page!' });
});

// Gihub auth
app.get('/auth/github', passport.authenticate('github'), github.auth);
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), github.authCallback);
app.get('/auth/logout', github.logout);

// Users
app.get('/api/user', users.get);
app.post('/api/user', users.create);

// Github api
app.get('/api/getRepos', repos.getReposRoute);
app.post('/api/getRepo', repos.getRepoRoute);

app.post('/api/createIssue', issues.createIssueRoute);
app.post('/api/getIssue', issues.getIssueRoute);
app.post('/api/closeIssue', issues.closeIssueRoute);

app.post('/api/addHook', hooks.addHookRoute);
app.post('/api/removeHook', hooks.removeHookRoute);
app.post('/api/commit', hooks.webHook);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

// if run as root, downgrade to the owner of this file
if (process.getuid() === 0) {
  require('fs').stat(__filename, function (err, stats) {
    if (err) { return console.error(err); }
    process.setuid(stats.uid);
  });
}
