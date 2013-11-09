require('nko')('z-wqAWVjbCSKa06J');
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
  ejsLayouts = require('express-ejs-layouts'),
  Utils = require('./classes/Utils.js'),
  utils = new Utils(),
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
app.set('layout', 'default');
app.use(ejsLayouts);
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
    issues = require('./routes/github/issues'),
    hooks = require('./routes/github/hooks'),
    files = require('./routes/github/files'),

    // Gitdo imports
    gitdoUsers = require('./routes/users'),
    gitdoRepos = require('./routes/repos');

/**
* Github Routes
*/

// Gihub auth
app.get('/auth/github', passport.authenticate('github'), github.auth);
app.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
}), github.authCallback);
app.get('/auth/logout', github.logout);

// Github api
app.get('/api/getRepos', repos.getReposRoute);
app.post('/api/getRepo', repos.getRepoRoute);

app.post('/api/createIssue', issues.createIssueRoute);
app.post('/api/getIssue', issues.getIssueRoute);
app.post('/api/closeIssue', issues.closeIssueRoute);

app.post('/api/addHook', hooks.addHookRoute);
app.post('/api/removeHook', hooks.removeHookRoute);
app.post('/api/commit', hooks.webHook);

/**
* Gitdo Routes
*/

// User
app.get('/api/user', gitdoUsers.get);
app.post('/api/user', gitdoUsers.create);

// Repos
app.get('/api/repos', gitdoRepos.getAllRoute);
app.get('/api/repo', gitdoRepos.getRoute);
app.post('/api/repo', gitdoRepos.createRoute);
app.delete('/api/repo/:name', gitdoRepos.deleteRoute);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

/**
* Views
*/
app.get('/', function (req, res) {
  res.render('index',
    {
      layout: 'landing-page'
    }
  );
});

app.get('/repos', function (req, res) {
  // Get list of repos from GitHub
  repos.getRepos(req.user.accessToken, function (err, repos) {
    gitdoRepos.getAll(req, res, function (gdRepos) {
      //this is the worst but Roman said its okay
      var gdReposObj = utils.arrayToObj(gdRepos, "ghid");

      for (var i = 0; i < repos.length; i++) {
        var id = repos[i].id;

        if (gdReposObj[id]) {
          repos[i].gitdo = true;
        }
      }

      res.render('repos', {
        user: {
          avatar: req.user._json.avatar_url, 
          name: req.user.displayName || req.user.username
        },
        repos: repos
      });
    }); 
  });
});

app.get('/dashboard', function (req, res) {
  gitdoRepos.getAll(req, res, function (repos) {
    res.render('dashboard', {
      user: {
        avatar: req.user._json.avatar_url, 
        name: req.user.displayName || req.user.username
      },
      repos: repos
    });
  });
});

app.get('/dashboard/:repo', function (req, res) {
  res.render('issues', {
    user: {
      avatar: req.user._json.avatar_url, 
      name: req.user.displayName || req.user.username
    },
    issues: [
    {
      "name": "[string]",
      "filename": "[string]",
      "line": "[number]",
      "branch": "[string]",
      "srcLink": "[string]",
      "github": {
        "body": "[string]",
        "created_at": "[string]"
      }
    },
    {
      "name": "[string]",
      "filename": "[string]",
      "line": "[number]",
      "branch": "[string]",
      "srcLink": "[string]",
      "github": {
        "body": "[string]",
        "created_at": "[string]"
      }
    },
    {
      "name": "[string]",
      "filename": "[string]",
      "line": "[number]",
      "branch": "[string]",
      "srcLink": "[string]",
      "github": {
        "body": "[string]",
        "created_at": "[string]"
      }
    },
    {
      "name": "[string]",
      "filename": "[string]",
      "line": "[number]",
      "branch": "[string]",
      "srcLink": "[string]",
      "github": {
        "body": "[string]",
        "created_at": "[string]"
      }
    },
    {
      "name": "[string]",
      "filename": "[string]",
      "line": "[number]",
      "branch": "[string]",
      "srcLink": "[string]",
      "github": {
        "body": "[string]",
        "created_at": "[string]"
      }
    }]
  });
});


// if run as root, downgrade to the owner of this file
if (process.getuid() === 0) {
  require('fs').stat(__filename, function (err, stats) {
    if (err) { return console.error(err); }
    process.setuid(stats.uid);
  });
}
