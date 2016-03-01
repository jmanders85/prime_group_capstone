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
      .state('new_reservation', {
        url: '/new_reservation',
        templateUrl: 'views/new_reservation.html',
        controller: 'NewReservationController'
      })
      .state('reservations', {
        url: '/reservations',
        templateUrl: 'views/reservations.html',
        controller: 'ReservationsController'
      })
      .state('edit_reservation', {
        url: '/edit_reservation',
        templateUrl: 'views/edit_reservation.html',
        controller: 'EditReservationController'
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
      .state('edit_asset', {
        url: '/edit_asset',
        templateUrl: 'views/edit_asset.html',
        controller: 'EditAssetController'
      })
      .state('available_assets', {
        url: '/available_assets',
        templateUrl: 'views/available_assets.html',
        controller: 'AvailableAssetsController'
      })
      .state('reserve_asset', {
        url: '/reserve_asset',
        templateUrl: 'views/reserve_asset.html',
        controller: 'ReserveFromAssetsController'
      })
      .state('asset_reservations', {
        url: '/asset_reservations',
        templateUrl: 'views/asset_reservations.html',
        controller: 'AssetReservationController'
      });

  $locationProvider.html5Mode(true);
}]);

app.controller('LoginController', ['$scope', '$http', '$location', '$window', function($scope, $http, $location, $window){

  $scope.login = function() {
    $window.location = '/login';
  };

  $http.get('/loggedIn').then(function(response){
    if (response.data) {
      $location.path('/home');
    }
  });
}]);

app.controller('HomeController', ['$scope', 'ReservationService', function($scope, ReservationService){

  $scope.loading = true;

  ReservationService.getEvents();
  ReservationService.getAssets();

  $scope.data = ReservationService.data;

  $scope.afterToday = function(item) {
    var itemDate = new Date(item.eventStartTime);
    var today = new Date();
    return itemDate > today;
  };

}]);

app.controller('AssetsController', function(){

});


app.controller('ReserveFromAssetsController', ['$scope', '$http', '$location',  'ReservationService', 'currentAsset',  function($scope, $http, $location, ReservationService, currentAsset) {

  ReservationService.getEvents();

  $scope.data = ReservationService.data;
  $scope.firstAsset = currentAsset.currentAsset;
  $scope.firstAsset.selected = true;
  $scope.assets = [];

  $scope.selectedEvent = '';
  $scope.selectedAssets = [$scope.firstAsset.id];
  $scope.reservedBy = '';
  $scope.events = ReservationService.data.eventsAfterToday;
  var badEvents = [];

  //get call that brings back only events that are not associated with this asset
  var getEventsByAsset = function(){
    $http({
      url: '/internal/getEventsByAsset',
      method: 'GET',
      params: {asset_id: $scope.firstAsset.id
      }
    }).then(function(response){
      for(i = 0; i < $scope.events.length; i++){
        for(j = 0; j < response.data.length; j++){
          if(parseInt($scope.events[i].id) == response.data[j].event_id){
            badEvents.push($scope.events[i]);
            $scope.events.splice(i, 1);
          }
        }
      }//close first for loop (i)
      //This checks the dates of each bad event against the other events.
      // console.log($scope.events);
      for(i=0; i<badEvents.length; i++){
        checkEvents(badEvents[i]);
      }

      function checkEvents(badEvent){
        for(i=0; i < $scope.events.length; i++){
          var eventStatus;
          var eventStart = $scope.events[i].start_date_time;
          var eventEnd = $scope.events[i].end_date_time;
          var badStart = badEvent.start_date_time;
          var badEnd = badEvent.end_date_time;
          //check if event conflicts
          if(eventStart > badStart && eventStart < badEnd){
            eventStatus = "fail";
          }else if(eventEnd > badStart && eventEnd < badEnd){
            eventStatus = "fail";
          }else if(badStart > eventStart && badStart < eventEnd){
            eventStatus = "fail";
          }else if(badEnd > eventStart && badEnd < eventEnd){
            eventStatus = "fail";
          }else{
            eventStatus = "pass";
          }
          if (eventStatus == "fail"){
            //splice from $scope.events
            $scope.events.splice(i, 1);
          }
        }//close for loop
      }//close checKEvents
    });
  };

  $scope.getAvailable = function(){
    var eventsList = ["'" + $scope.selectedEvent.id + "'"];
    for(i=0; i < $scope.events.length; i++){
      var eventStatus;
      var eventStart = $scope.events[i].start_date_time;
      var eventEnd = $scope.events[i].end_date_time;
      var badStart = $scope.selectedEvent.start_date_time;
      var badEnd = $scope.selectedEvent.end_date_time;
      //check if event conflicts
      if(eventStart > badStart && eventStart < badEnd){
        eventStatus = "fail";
      }else if(eventEnd > badStart && eventEnd < badEnd){
        eventStatus = "fail";
      }else if(badStart > eventStart && badStart < eventEnd){
        eventStatus = "fail";
      }else if(badEnd > eventStart && badEnd < eventEnd){
        eventStatus = "fail";
      }else{
        eventStatus = "pass";
      }
      if (eventStatus == "fail"){
        eventsList.push("'" + $scope.events[i].id + "'");
      }
    }//close for loop
    $scope.assets = [];
    // console.log(eventsList);

    $http({
      url: '/internal/getAvailable',
      method: 'GET',
      params: {event_list: '"' + eventsList + '"'
      }
    }).then(function(response){
      for(i=0; response.data.length; i++)
          //make sure our initial item doesn't get added again
        if(response.data[i].id !== $scope.firstAsset.id){
          $scope.assets.push(response.data[i]);
        }
    });
  };

  $scope.createReservation = function() {
    for (var i = 0; i < $scope.assets.length; i++) {
      if ($scope.assets[i].selected === true) {
        $scope.selectedAssets.push(parseInt($scope.assets[i].id));
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

  $scope.cancel = function() {
    window.history.back();
  };

  getEventsByAsset();

}]);


app.controller('NewReservationController', ['$scope', '$http', '$location',  'ReservationService',  function($scope, $http, $location, ReservationService) {

  ReservationService.getEvents();
  ReservationService.getAssets();
  $scope.data = ReservationService.data;
  $scope.assets = [];
  $scope.events = ReservationService.data.eventsAfterToday;

  $scope.selectedEvent = '';
  $scope.selectedAssets = [];
  $scope.reservedBy = '';

  $scope.getAvailable = function(){
    var eventsList = ["'" + $scope.selectedEvent.id + "'"];
    for(i=0; i < $scope.events.length; i++){
      var eventStatus;
      var eventStart = $scope.events[i].start_date_time;
      var eventEnd = $scope.events[i].end_date_time;
      var badStart = $scope.selectedEvent.start_date_time;
      var badEnd = $scope.selectedEvent.end_date_time;
      //check if event conflicts
      if(eventStart > badStart && eventStart < badEnd){
        eventStatus = "fail";
      }else if(eventEnd > badStart && eventEnd < badEnd){
        eventStatus = "fail";
      }else if(badStart > eventStart && badStart < eventEnd){
        eventStatus = "fail";
      }else if(badEnd > eventStart && badEnd < eventEnd){
        eventStatus = "fail";
      }else{
        eventStatus = "pass";
      }
      if (eventStatus == "fail"){
        eventsList.push("'" + $scope.events[i].id + "'");
      }
    }//close for loop
    $scope.assets = [];
    // console.log(eventsList);

    $http({
      url: '/internal/getAvailable',
      method: 'GET',
      params: {event_list: '"' + eventsList + '"'
      }
    }).then(function(response){
      $scope.assets = response.data;
    });
  };

  $scope.createReservation = function() {
    for (var i = 0; i < $scope.assets.length; i++) {
      if ($scope.assets[i].selected === true) {
        $scope.selectedAssets.push(parseInt($scope.assets[i].id));
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

  $scope.cancel = function() {
    window.history.back();
  };


}]);

app.controller('ReservationsController', ['$scope', '$http', '$location',  'ReservationService', function($scope, $http, $location, ReservationService){

  ReservationService.getAssets();
  ReservationService.getEvents();
  $scope.data = ReservationService.data;

  $scope.editReservation = function(reservation) {

    ReservationService.data.reservationToEdit = reservation;
    $location.path('edit_reservation');

  };

}]);

app.controller('EditReservationController', ['ReservationService', '$http', '$scope', '$location', function(ReservationService, $http, $scope, $location){

  $scope.data = ReservationService.data;
  $scope.events = ReservationService.data.events;
  $scope.assets = [];
  $scope.eventsAfterToday = ReservationService.data.eventsAfterToday;

  var reservationToEdit = ReservationService.data.reservationToEdit;

  var resToEditStartDate = new Date(reservationToEdit.eventStartTime);
  var today = new Date();

  if (resToEditStartDate < today) {
    $scope.eventsAfterToday.unshift({
      id: parseInt(reservationToEdit.event_id),
      title: reservationToEdit.eventTitle
    });
  }

  $scope.reservedBy = reservationToEdit.reserved_by;
  $scope.selectedAssets = [];


  for (var k = 0; k < $scope.data.events.length; k++) {
    if (parseInt(reservationToEdit.event_id) === $scope.events[k].id) {
      $scope.selectedEvent = $scope.events[k];
      break;
    }
  }

  $scope.getAvailable = function(){
    var eventsList = ["'" + $scope.selectedEvent.id + "'"];
    for(i=0; i < $scope.events.length; i++){
      var eventStatus;
      var eventStart = $scope.events[i].start_date_time;
      var eventEnd = $scope.events[i].end_date_time;
      var badStart = $scope.selectedEvent.start_date_time;
      var badEnd = $scope.selectedEvent.end_date_time;
      //check if event conflicts
      if(eventStart > badStart && eventStart < badEnd){
        eventStatus = "fail";
      }else if(eventEnd > badStart && eventEnd < badEnd){
        eventStatus = "fail";
      }else if(badStart > eventStart && badStart < eventEnd){
        eventStatus = "fail";
      }else if(badEnd > eventStart && badEnd < eventEnd){
        eventStatus = "fail";
      }else{
        eventStatus = "pass";
      }
      if (eventStatus == "fail"){
        eventsList.push("'" + $scope.events[i].id + "'");
      }
    }//close for loop
    $scope.assets = [];
    // console.log(eventsList);

    $http({
      url: '/internal/getAvailable',
      method: 'GET',
      params: {event_list: '"' + eventsList + '"'
      }
    }).then(function(response){
      $scope.assets = response.data;
      for (var i = 0; i < reservationToEdit.assets.length; i++) {
        for (var j = 0; j < $scope.assets.length; j++) {
          if (reservationToEdit.assets[i].name === $scope.assets[j].name) {
            $scope.assets[j].selected = true;
            break;
          }
        }
      }
      if (reservationToEdit.event_id == $scope.selectedEvent.id) {
        for (var it = 0; it < reservationToEdit.assets.length; it++) {
          reservationToEdit.assets[it].selected = true;
          $scope.assets.push(reservationToEdit.assets[it]);
        }
      }
    });
  };

  $scope.getAvailable();

  $scope.updateReservation = function() {
    for (var i = 0; i < $scope.assets.length; i++) {
      if ($scope.assets[i].selected === true) {
        $scope.selectedAssets.push($scope.assets[i].id);
      }
    }

    $http.put('internal/reservation', {
      "id": reservationToEdit.id,
      "eventId": $scope.selectedEvent.id,
      "selectedAssets": $scope.selectedAssets,
      "reservedBy": $scope.reservedBy
    }).then(function(response) {
      if (response.status === 200) {
        ReservationService.getReservations();
        $location.path('/reservations');
      } else {
        console.log("error");
      }
    });
  };

  $scope.deleteReservation = function() {
    var deleteConfirm = confirm("You are about to permanantly delete this reservation. Click 'OK' to continue.");
    if (deleteConfirm === true){
      $http.delete('/internal/reservation/' + reservationToEdit.id).then(function(response){

        if (response.status === 200) {
          ReservationService.getReservations();
          $location.path('/reservations');
        } else {
          console.log("error deleting reservation");
        }

      });
    }
  };

  $scope.cancel = function() {
    window.history.back();
  };

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

// app.controller('AvailableAssetsController', ['$scope', '$http', 'ReservationService', 'currentAsset', '$location', function($scope, $http, ReservationService, currentAsset, $location){
//
//   $scope.startDate;
//   $scope.startTime;
//   $scope.endDate;
//   $scope.endTime;
//   var badEvents = [];
//   ReservationService.getEvents();
//   ReservationService.getAssets();
//   ReservationService.getReservations();
//
//   $scope.assets = [];
//
//   $scope.getAvailable = function(){
//     // console.log("start time:", $scope.startTime);
//     //Thu Jan 01 1970 00:00:00 GMT-0600 (CST)
//     //2016-01-01T06:00:00.000Z
//     var reservationID;
//     var startDateTime;
//     var endDateTime;
//
//     //format the date time!
//     if($scope.startTime !== undefined){
//       startDateTime = ($scope.startDate.toISOString()).slice(0,11) + ($scope.startTime.toISOString()).slice(11,24);
//     }else if($scope.startTime === undefined){
//       startDateTime = $scope.startDate.toISOString();
//     }
//
//     if($scope.endTime !== undefined){
//       endDateTime = ($scope.endDate.toISOString()).slice(0,11) + ($scope.startTime.toISOString()).slice(11,24);
//     }else if($scope.endTime === undefined){
//       endDateTime = $scope.endDate.toISOString();
//     }
//
//     var reservations = ReservationService.data.reservations;
//     var events = ReservationService.data.events;
//
//     // console.log("start date/time:", startDateTime);
//
//     //Run through each event to check it's 'status'
//     for(i=0; i<events.length; i++){
//       checkEvents(events[i]);
//     }
//
//     function checkEvents(event){
//       var eventStatus;
//       var eventStart = events[i].start_date_time;
//       var eventEnd = events[i].end_date_time;
//       //check if event conflicts
//       if(eventStart > startDateTime && eventStart < endDateTime){
//         eventStatus = "fail";
//       }else if(eventEnd > startDateTime && eventEnd < endDateTime){
//         eventStatus = "fail";
//       }else if(startDateTime > eventStart && startDateTime < eventEnd){
//         eventStatus = "fail";
//       }else if(endDateTime > eventStart && endDateTime < eventEnd){
//         eventStatus = "fail";
//       }else{
//         eventStatus = "pass";
//       }
//       //if unconflicting, use event ID to find reservations
//       if (eventStatus == "fail"){
//         badEvents.push(" '" + events[i].id + "'");
//         // console.log(events[i].id);
//       }
//     }//close checKEvents
//
//     //Checks available assets in the database based on the events in badEvents
//     var checkAssets = function(){
//       $scope.assets = [];
//       var event_list = '"' + badEvents + '"';
//       $http({
//         url: '/internal/getAvailable',
//         method: 'GET',
//         params: {event_list: event_list
//         }
//       }).then(function(response){
//         for(i=0; i<response.data.length; i++){
//           $scope.assets.push(response.data[i]);
//         }
//       });
//     };
//     checkAssets();
//   };//close $scope.getAvailable
//
//   $scope.reserveAsset = function(asset){
//     console.log(asset.id);
//     currentAsset.setAsset(asset);
//     $location.path('reserve_asset');
//   };
// }]);

app.controller('ViewAssetsController', ['$scope', '$http', '$location', 'currentAsset','ReservationService', function($scope, $http, $location, currentAsset,ReservationService){
  $scope.assets = [];
  $scope.sortBy = "Name";
  $scope.sortOptions = ["Category", "Name", "Recently Created"];
  $scope.searchKeyword = '';
  $scope.noRecord = false;
  $scope.startDate;
  $scope.startTime;
  $scope.endDate;
  $scope.endTime;
  var badEvents = [];
  ReservationService.getEvents();
  ReservationService.getAssets();
  ReservationService.getReservations();

  $scope.getAssets = function(){
    $scope.noRecord = false;
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
      if ($scope.assets.length >= 1) {
        $scope.noRecord = false;
      }
      else {
        $scope.noRecord = true;
      }
    });
  };

  $scope.getAvailable = function(){
    // console.log("start time:", $scope.startTime);
    //Thu Jan 01 1970 00:00:00 GMT-0600 (CST)
    //2016-01-01T06:00:00.000Z
    var reservationID;
    var startDateTime;
    var endDateTime;

    //format the date time!
    if($scope.startTime !== undefined){
      startDateTime = ($scope.startDate.toISOString()).slice(0,11) + ($scope.startTime.toISOString()).slice(11,24);
    }else if($scope.startTime === undefined){
      startDateTime = $scope.startDate.toISOString();
    }

    if($scope.endTime !== undefined){
      endDateTime = ($scope.endDate.toISOString()).slice(0,11) + ($scope.startTime.toISOString()).slice(11,24);
    }else if($scope.endTime === undefined){
      endDateTime = $scope.endDate.toISOString();
    }

    var reservations = ReservationService.data.reservations;
    var events = ReservationService.data.events;

    // console.log("start date/time:", startDateTime);

    //Run through each event to check it's 'status'
    for(i=0; i<events.length; i++){
      checkEvents(events[i]);
    }

    function checkEvents(event){
      var eventStatus;
      var eventStart = events[i].start_date_time;
      var eventEnd = events[i].end_date_time;
      //check if event conflicts
      if(eventStart > startDateTime && eventStart < endDateTime){
        eventStatus = "fail";
      }else if(eventEnd > startDateTime && eventEnd < endDateTime){
        eventStatus = "fail";
      }else if(startDateTime > eventStart && startDateTime < eventEnd){
        eventStatus = "fail";
      }else if(endDateTime > eventStart && endDateTime < eventEnd){
        eventStatus = "fail";
      }else{
        eventStatus = "pass";
      }
      //if unconflicting, use event ID to find reservations
      if (eventStatus == "fail"){
        badEvents.push(" '" + events[i].id + "'");
        // console.log(events[i].id);
      }
    }//close checKEvents

    //Checks available assets in the database based on the events in badEvents
    var checkAssets = function(){
      $scope.assets = [];
      var event_list = '"' + badEvents + '"';
      $http({
        url: '/internal/getAvailable',
        method: 'GET',
        params: {event_list: event_list
        }
      }).then(function(response){
        for(i=0; i<response.data.length; i++){
          $scope.assets.push(response.data[i]);
        }
      });
    };
    checkAssets();
  };//close $scope.getAvailable


  $scope.getAssets();

  $scope.editAsset = function(asset){
    currentAsset.setAsset(asset);
    $location.path('edit_asset');
  };


  $scope.viewReservations = function(asset){
    $http.get('internal/assetReservations/' + asset.id).then(function(response){
      ReservationService.data.assetreservation = response.data;
      for (var i = 0; i < ReservationService.data.assetreservation.length; i++) {
        var thisRes = ReservationService.data.assetreservation[i];
        var eventId = thisRes.event_id;

        for (var j = 0; j < ReservationService.data.events.length; j++) {
          var thisEvent = ReservationService.data.events[j];
          if (parseInt(eventId) === thisEvent.id) {
            thisRes.eventTitle = thisEvent.title;
            thisRes.eventStartTime = thisEvent.start_date_time;
            thisRes.eventEndTime = thisEvent.end_date_time;
            break;
          }
        }
      }

      ReservationService.data.assetreservation.sort(function(a,b){
        var aDate = new Date(a.eventStartTime);
        var bDate = new Date(b.eventStartTime);
        return aDate - bDate;
      });

      ReservationService.data.assetreservation.name = asset.name;
      ReservationService.data.assetreservation.id = asset.id;

      $location.path('asset_reservations');
    });
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
      params: {
        name: $scope.data.name,
        description: $scope.data.description,
        category: $scope.data.category,
        notes: $scope.data.notes,
        id: $scope.data.id
      }
    }).then(function(response){
      $location.path(response.data);
    });
  };




  $scope.deleteAsset = function(){
    var deleteConfirm = confirm("You are about to permanantly delete this item from the inventory. Click 'OK' to continue.");
    if (deleteConfirm === true){
    $http.delete('/internal/asset/' + $scope.data.id)
        .then(function(response){
              if (response.status === 200) {
                $location.path('/view_assets');
              } else {
                console.log("error deleting asset");
              }
            }
        );
    }
  };

  $scope.goBack = function(){
    window.history.back();
  };
}]);

app.controller('AssetReservationController', ['$scope', '$http', '$location', 'ReservationService', 'currentAsset', function($scope, $http, $location, ReservationService, currentAsset){
  $scope.data = ReservationService.data;


  $scope.reserveAsset = function(asset){
    currentAsset.setAsset(asset);
    $location.path('reserve_asset');
  };

  $scope.editReservation = function(reservation) {
    ReservationService.data.reservationToEdit = reservation;
    $location.path('edit_reservation');

  };
}]);



//[][][][][][][]][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]
//                            Factories
//[][][][][][][]][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]

app.factory('currentAsset', [function(){
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

  var getReservations = function() {
    $http.get('internal/getReservations').then(function (response) {
      data.reservations = response.data;

      for (var i = 0; i < data.reservations.length; i++) {
        var thisRes = data.reservations[i];
        var eventId = thisRes.event_id;

        for (var j = 0; j < data.events.length; j++) {
          var thisEvent = data.events[j];
          if (parseInt(eventId) === thisEvent.id) {
            thisRes.eventTitle = thisEvent.title;
            thisRes.eventStartTime = thisEvent.start_date_time;
            thisRes.eventEndTime = thisEvent.end_date_time;
            break;
          }
        }
      }

      data.reservations.sort(function(a,b){
        var aDate = new Date(a.eventStartTime);
        var bDate = new Date(b.eventStartTime);
        return aDate - bDate;
      });
    });
  };

  var getEvents = function() {
    var siteDetails;
    var siteId;

    $http.get('/api/siteList').then(function(response){
      siteDetails = response.data[0];
      siteId = siteDetails.id;
      $http.get('/api/eventList/' + siteId).then(function(response){
        data.events = response.data.events;
        data.eventsAfterToday = [];
        for (var i = 0; i < response.data.events.length; i++) {
          var eventDate = new Date(response.data.events[i].start_date_time);
          var today = new Date();
          if (eventDate >= today) {
            data.eventsAfterToday.push(response.data.events[i]);
          }
        }
        getReservations();
      });
    });

  };

  var getAssets = function(){
    $http.get('internal/getAssets').then(function(response){
      data.assets = response.data;
    });
  };

  return {
    data: data,
    getEvents: getEvents,
    getAssets: getAssets,
    getReservations: getReservations
  };

}]);
