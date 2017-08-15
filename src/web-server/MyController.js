var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function($scope,firebaseService){

  $scope.messages = [];
  $scope.thingToSay = ""

  $scope.submitChat = function(){
    console.log("chat is " + $scope.thingToSay)
    $scope.thingToSay = ""
  }
});
