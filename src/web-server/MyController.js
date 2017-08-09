var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function($scope,firebaseService){

  $scope.messages = [];

  firebaseService.ref("/messages", 'child_added', function(error, data){
    if(error){
      throw error;
      return
    }
    else{
      $scope.messages.push(data)
    }

  })

  setInterval(function(){

     json = {
          "chat_room_id" : "goog",
          "body" : "amit"
        }

     firebaseService.push("/messages",json);
   },300)
});
