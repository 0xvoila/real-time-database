var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function(firebaseService){

  firebaseService.ref(",messages", function(data){
    console.log(data);
  })

  firebaseService.set(",messages",{"name":"amit"});
});
