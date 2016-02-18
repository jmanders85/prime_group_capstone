var app = angular.module('sportApp', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
  $stateProvider
    .state('login', {
     url: '/',
     templateUrl: 'views/login.html'
   }),
   $stateProvider
     .state('home', {
      url: '/home',
      templateUrl: 'views/home.html',
      controller: 'HomeController'
     })

  $locationProvider.html5Mode(true);
}]);

app.controller('HomeController', ['$scope', function($scope){

}]);
