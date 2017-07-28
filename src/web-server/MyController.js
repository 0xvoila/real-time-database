var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function(firebaseService){

  firebaseService.database("test").ref(",messages", function(data){
    console.log(data);
  })

  firebaseService.database('test').set(",messages",{"name":"amit"});
});
