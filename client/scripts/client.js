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
    .state('view_assets', {
      url: '/view_assets',
      templateUrl: 'views/view_assets.html',
      controller: 'ViewAssetsController'
    })
    .state('calendar', {
      url: '/calendar',
      templateUrl: 'views/calendar.html',
      controller: 'CalendarController'
    })
    .state('edit_asset', {
      url: '/edit_asset',
      templateUrl: 'views/edit_asset.html',
      controller: 'EditAssetController'
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
  $scope.categoryList = ["Practice", "Player Equipment", "Game", "Other"]; //***If you change these, change the ones in the EditAssetController!

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

app.controller('ViewAssetsController', ['$scope', '$http', '$location', 'currentAsset', function($scope, $http, $location, currentAsset){
  $scope.assets = [];

  $scope.getAssets = function(){
    $http.get('internal/getAssets').then(function(response){
      $scope.assets = response.data;
    });
  };

  $scope.editAsset = function(asset){
    // console.log(asset);
    currentAsset.setAsset(asset);
    $location.path('edit_asset');
  };

}]);

app.controller('EditAssetController', ['$scope', '$http', '$location', 'currentAsset', function($scope, $http, $location, currentAsset){
  $scope.data = currentAsset.currentAsset;
  $scope.categoryList = ["Practice", "Player Equipment", "Game", "Other"]; //***If you change these, change the ones in the NewAssetController

  $scope.updateAsset = function(){
    console.log($scope.data);
    $http({
        url: '/internal/updateAsset',
        method: 'POST',
        params: {name: $scope.data.name,
                description: $scope.data.description,
                category: $scope.data.category,
                notes: $scope.data.notes,
                id: $scope.data.id
                }
    }).then(function(response){
      $location.path(response.data);
    });
  };

  $scope.goBack = function(){
    window.history.back();
  };

}]);



//[][][][][][][]][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]
//                            Factories
//[][][][][][][]][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]

app.factory('currentAsset', ['$http', function($http){
  var currentAsset = {};

  var setAsset = function(asset){
    currentAsset.id = asset.id;
    currentAsset.name = asset.name;
    currentAsset.description = asset.description;
    currentAsset.category = asset.category;
    currentAsset.notes = asset.notes;
  };

  var clearCurrentAsset = function(){
    currentAsset = {};
  };

  return {
    currentAsset: currentAsset,
    setAsset: setAsset,
    clearCurrentAsset: clearCurrentAsset
  };

}]);
