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
    .state('new_asset', {
      url: '/new_asset',
      templateUrl: 'views/new_asset.html',
      controller: 'NewAssetController'
    })
    .state('calendar', {
      url: '/calendar',
      templateUrl: 'views/calendar.html',
      controller: 'CalendarController'
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

app.controller('LoginController', ['$scope', '$http', function($scope, $http){
  $scope.siteDetails = {};
  $scope.eventsList = [];
  $scope.siteId;

  $scope.userInfo = function() {
    $http.get('/api/userInfo').then(function(response){
      console.log(response.data.result);
    });
  };

  $scope.siteList = function() {
    $http.get('/api/siteList').then(function(response){
      $scope.siteDetails = response.data[0];
      $scope.siteId = $scope.siteDetails.id;
    });
  };

  $scope.eventsList = function() {
    $http.get('/api/eventList/' + $scope.siteId).then(function(response){
      $scope.eventsList = response.data.events;
    });
  };
}]);

app.controller('HomeController', ['$scope', function($scope){

}]);

app.controller('AssetsController', ['$scope', function($scope){

}]);

app.controller('NewReservationController', ['$scope', function($scope){

}]);

app.controller('CalendarController', ['$scope', function($scope){

}]);

app.controller('NewAssetController', ['$scope', '$http', '$location', function($scope, $http, $location){
  $scope.data = {};
  $scope.categoryList = ["Practice", "Player Equipment", "Game", "Other"]; //***We still need to decide what categories!

  $scope.submitAsset = function(){
    console.log($scope.data);
    $http({
        url: '/internal/newAsset',
        method: 'POST',
        params: {name: $scope.data.name,
                description: $scope.data.description,
                category: $scope.data.category,
                notes: $scope.data.notes
                }
    }).then(function(response){
      $location.path(response.data);
    });
  };
}]);

app.controller('view-editAssetsController', ['$scope', function($scope){

}]);
