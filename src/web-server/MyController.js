var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function($scope,firebaseService){

  $scope.messages = [];

  function gup(name) {
      name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regexS = "[\\?&]"+name+"=([^&#]*)";
      var regex = new RegExp( regexS );
      var results = regex.exec( window.location.href );
      if( results == null )
          return null;
      else
          return results[1];
  }

  if(gup("type") == "get" || gup("type") == "all"){

    firebaseService.ref("/messages", 'child_added', function(error, data){
      if(error){
        throw error;
        return
      }
      else{
        $scope.messages.push(data)
      }

    });
  }

  if(gup("type") == "get" || gup("type") == "all"){
    setInterval(function(){

       json = {
            "chat_room_id" : "goog",
            "body" : "amit"
          }

       firebaseService.push("/messages",json);
     },300);
  }
});
