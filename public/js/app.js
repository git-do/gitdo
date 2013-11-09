'use strict';

var app = window.app = angular.module('app', []);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/dashboard', {
      controller: 'dashController'
    });
});
