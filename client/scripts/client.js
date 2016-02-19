var app = angular.module('sportApp', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'views/login.html',
      controller: 'LoginController'
    })
    .state('home', {
      url: '/home',
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .state('assets', {
      url: '/assets',
      templateUrl: 'views/assets.html',
      controller: 'AssetsController'
    })
    .state('newReservation', {
      url: '/newReservation',
      templateUrl: 'views/newReservation.html',
      controller: 'NewReservationController'
    })
    .state('calendar', {
      url: '/calendar',
      templateUrl: 'views/calendar.html',
      controller: 'calendarController'
    })
    .state('view-editAssets', {
      url: '/viewEditAssets',
      templateUrl: 'views/viewEditAssets.html',
      controller: 'viewEditAssetsController'
    })
    .state('availableAssets', {
      url: '/viewEditAssets',
      templateUrl: 'views/viewEditAssets.html',
      controller: 'viewEditAssetsController'
    });
  $locationProvider.html5Mode(true);
}]);

app.controller('LoginController', ['$scope', function($scope){

}]);

app.controller('HomeController', ['$scope', function($scope){

}]);

app.controller('AssetsController', ['$scope', function($scope){

}]);

app.controller('NewReservationController', ['$scope', function($scope){

}]);

app.controller('calendarController', ['$scope', function($scope){

}]);

app.controller('view-editAssetsController', ['$scope', function($scope){

}]);
