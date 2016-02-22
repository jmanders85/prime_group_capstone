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
    .state('reservations', {
      url: '/reservations',
      templateUrl: 'views/reservations.html',
      controller: 'ReservationsController'
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
    .state('available_assets', {
      url: '/available_assets',
      templateUrl: 'views/available_assets.html',
      controller: 'AvailableAssetsController'
    });
  $locationProvider.html5Mode(true);
}]);

app.controller('LoginController', ['$scope', '$http', function($scope, $http){

}]);

app.controller('HomeController', ['$scope', function($scope){

}]);

app.controller('AssetsController', ['$scope', function($scope){

}]);

app.controller('NewReservationController', ['$scope', '$http', '$location',  'ReservationService',  function($scope, $http, $location, ReservationService) {

  ReservationService.getEvents();
  ReservationService.getAssets();
  $scope.data = ReservationService.data;

  $scope.selectedEvent = '';
  $scope.selectedAssets = [];
  $scope.reservedBy = '';


  $scope.createReservation = function() {
    for (var i = 0; i < $scope.data.assets.length; i++) {
      if ($scope.data.assets[i].selected === true) {
        $scope.selectedAssets.push(parseInt($scope.data.assets[i].id));
      }
    }

    $http.post('internal/reservation', {
      "eventId": $scope.selectedEvent.id,
      "selectedAssets": $scope.selectedAssets,
      "reservedBy": $scope.reservedBy
    }).then(function(response) {
      if (response.status === 200) {
        $location.path('/reservations');
      } else {
        console.log("error");
      }
    });
  };

}]);

app.controller('ReservationsController', ['$scope', '$http', 'ReservationService', function($scope, $http, ReservationService){
  ReservationService.getReservations();
  $scope.data = ReservationService.data;
  }]);

app.controller('CalendarController', ['$scope', '$http', 'ReservationService',  function($scope, $http, ReservationService){
  ReservationService.getEvents();
  $scope.data = ReservationService.data;
}]);

app.controller('NewAssetController', ['$scope', '$http', '$location', function($scope, $http, $location){
  $scope.data = {};
  $scope.categoryList = ["Practice", "Player Equipment", "Game", "Other"]; //***If you change these, change the ones in the EditAssetController!

  $scope.submitAsset = function(){
    console.log($scope.data);
    $http({
        url: '/internal/newAsset',
        method: 'POST',
        params: {
          name: $scope.data.name,
          description: $scope.data.description,
          category: $scope.data.category,
          notes: $scope.data.notes
        }
    }).then(function(response){
      $location.path(response.data);
    });
  };
}]);

app.controller('AvailableAssetsController', ['$scope', function($scope){

}]);

app.controller('ViewAssetsController', ['$scope', '$http', '$location', 'currentAsset', function($scope, $http, $location, currentAsset){
  $scope.assets = [];
  $scope.sortBy = "Name";
  $scope.sortOptions = ["Category", "Name", "Recently Created"];
  $scope.searchKeyword = '';

  $scope.getAssets = function(){
    var keyword = '%' + $scope.searchKeyword + '%';

    $http({
      url: '/internal/getAssets',
      method: 'GET',
      params: {
        sortBy: $scope.sortBy,
        keyword: keyword
      }
    }).then(function(response){
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

app.factory('ReservationService', ['$http', function($http){

  var data = {};

  var getEvents = function() {
    var siteDetails;
    var siteId;

    $http.get('/api/siteList').then(function(response){
      siteDetails = response.data[0];
      siteId = siteDetails.id;
      $http.get('/api/eventList/' + siteId).then(function(response){
        data.events = response.data.events;
      });
    });

  };

  var getAssets = function(){
      $http.get('internal/getAssets').then(function(response){
        data.assets = response.data;
      });
  };

  var getReservations = function() {
    $http.get('internal/getReservations').then(function (response) {
      data.reservations = response.data
    });
  };

  return {
    data: data,
    getEvents: getEvents,
    getAssets: getAssets,
    getReservations: getReservations
  };

}]);
