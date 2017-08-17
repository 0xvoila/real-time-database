var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function($scope,firebaseService){

  $scope.messages = [];
  $scope.thingToSay = ""

  $scope.submitChat = function(){
    console.log("chat is " + $scope.thingToSay)
    var data = {"body":$scope.thingToSay}
    firebaseService.push("/messages", data)
    $scope.thingToSay = ""
  }

  firebaseService.database().ref("/594b61f0eb83efac8a351e79/chat/579f25faa826cbcf5642bfee/messages/5995b327bdb31426ea803d65").on("child_changed", function(error,data){
    $scope.messages.push(data)
  })

  firebaseService.database().ref("/messages").on("child_added", function(error,data){
    $scope.messages.push(data)
  })
});
