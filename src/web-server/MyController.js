var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function($scope,firebaseService){

  $scope.messages = [];
  $scope.mymessages = [];
  $scope.myData = null

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

    firebaseService.database().ref("/messages").once('child_added', function(error, data){
      if(error){
        throw error;
        return
      }
      else{
        $scope.myData = data["/"]["messages"]
      }

    });

    var ref = firebaseService.database().ref("/messages")
    ref.on('value', function(error, data){
      if(error){
        throw error;
        return
      }
      else{
        $scope.messages.push(data)
      }

    });

    ref.off()

    var ref = firebaseService.database().ref("/messages")
    ref.on('child_added', function(error, data){
      if(error){
        throw error;
        return
      }
      else{
        $scope.mymessages.push(data["/"]["messages"])
      }

    });

  }

  if(gup("type") == "push" || gup("type") == "all"){
    var i=0;
    setInterval(function(){
       json = {
            "chat_room_id" : "goog",
            "body" : "amit",
            "counter": i
          }

       firebaseService.push("/messages",json);
       i++;
     },10000);
  }
});
