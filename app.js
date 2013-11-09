
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

/* --------------------
// GITHUB SETUP
-----------------------*/
var GITHUB_CLIENT_ID = "546f4d5ead70fc95aa41";
var GITHUB_CLIENT_SECRET = "1ddaecee7d8acdb427bb775ec9f8acf312609700"; // "Ignore Security"

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

// development only
if ('development' === app.get('env')) {
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
app.set('port', process.env.PORT || 3000);
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

var github = require('./routes/github');

// Views
app.get('/', function (req, res) {
  res.render('index', { title: 'The index page!' });
});

// Gihub auth
app.get('/auth/github', passport.authenticate('github'), github.auth);
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), github.authCallback);
app.get('/auth/logout', github.logout);

// Github api
app.get('/api/getRepos', github.getRepos);
app.post('/api/getRepo', github.getRepo);
app.post('/api/commit', github.hook);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
