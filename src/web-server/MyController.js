var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function(firebaseService){

  firebaseService.ref("/messages", function(error, data){
    if(error){
      throw error;
      return
    }
    else{
      var mydata = parseInt(data[0]) + 1;
      console.log(mydata);
      firebaseService.push("/messages",{"counter":mydata});
    }

  })


  for( var i=0; i<100;i++){
     console.log(i);
     firebaseService.push("/messages",{"counter":"100"});
   }
  //firebaseService.set(",messages",{"users":"amit"});
 //setInterval(function(){
  //firebaseService.push(",messages",{"counter":"100"});
 //},50)


});
