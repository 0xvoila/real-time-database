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

  for( var i=0; i<10;i++){

     json = {
          "chat_room_id" : i,
          "body" : i
        }

     firebaseService.push("/messages",json);
   }
});
