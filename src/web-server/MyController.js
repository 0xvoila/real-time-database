var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function(firebaseService){

  firebaseService.ref(",messages,users", function(data){
    console.log(data);
  })

  firebaseService.set(",messages",{"users":"amit"});
});
