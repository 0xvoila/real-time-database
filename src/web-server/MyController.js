var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function(firebaseService){

  firebaseService.ref(",messages,users", function(error, data){
    if(error){
      throw error;
      return
    }
    else{
      console.log(data);
    }

  })

  firebaseService.set(",messages",{"users":"amit"});
});
