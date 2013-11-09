'use strict';

/*global app */

app.controller('indexController', function ($scope) {
  $scope.helloWorld = 'Hello World';
  
  var repos = utils.jhr('/api/getRepos', function (json) {
    for (var i = 0; i < json.length; i++) {
      json[i].name = json[i].fullname.split('/')[1];

    }

    $scope.repositories = json;
  });
});
