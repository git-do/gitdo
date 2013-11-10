var
  moment = require("moment"),
  gitdoIssues = require("../issues.js"),
  Issues = {};

// Render
Issues.render = function (req, res, issues) {
  Issues.addRelativeUpdate(issues);
  var sortedIssues = Issues.sortByState(issues);
  res.render('issues', {
    active: 'dash',
    user: {
      avatar: req.user._json.avatar_url,
      name: req.user.displayName || req.user.username
    },
    repo: req.params.repo,
    issues: sortedIssues
  });
};

// Generate github data
Issues.generateGithubData = function (issue) {
  issue.github = {
    title: issue.title,
    created_at: issue.dateCreated,
    body: issue.description,
    html_url: false
  };
};

Issues.addRelativeUpdate = function (issues) {

  issues.forEach(function (issue) {
    issue.relativeUpdated = moment(issue.dateUpdated || issue.dateCreated).fromNow();
  });

  return issues;
};

// Sort by state
Issues.sortByState = function (issues) {
  var sortedObj = {
    open: [],
    closed: [],
    marked: []
  };
  issues.forEach(function (issue) {
    var state = "open";

    // If there is no github data, it's closed
    // @TODO: if there is no github data but it's open, mark as closed
    if (!issue.github) {
      state = "closed";
      Issues.generateGithubData(issue);
    
    // If there is github data but it's marked closed, it's been
    // manually marked (the code should still be in the repo)
    } else if (issue.state === "closed") {
      state = "marked";
    }
    sortedObj[state].push(issue);
  });
  return sortedObj;
};

module.exports = function(req, res) {
  if (req.user) {
    gitdoIssues.getAll(req, res, function (issues) {
      Issues.render(req, res, issues);
    });
  } else {
    res.redirect("/");
  }
};
