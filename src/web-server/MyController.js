var myApp = angular.module('myApp',['angular-md5']);

var myController = myApp.controller('myController',function($scope,firebaseService){

  $scope.messages = [];
  $scope.thingToSay = ""

  $scope.submitChat = function(){
    console.log("chat is " + $scope.thingToSay)
    var data = {"body":$scope.thingToSay}
    firebaseService.push("/messages", data)
    $scope.thingToSay = ""
  }

  firebaseService.database().ref("/messages").on("child_changed", function(error,data){
    $scope.messages.push(data)
  })

  firebaseService.database().ref("/messages").on("child_added", function(error,data){
    $scope.messages.push(data)
  })
});
