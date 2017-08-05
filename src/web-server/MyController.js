var myApp = angular.module('myApp',[]);

var myController = myApp.controller('myController',function(firebaseService){

  firebaseService.ref("/messages", 'child_added', function(error, data){
    if(error){
      throw error;
      return
    }
    else{
      console.log(data);
    }

  })


  for( var i=0; i<100;i++){

     json = {
          "users": {
            "amit": {
              "my_date_of_birth": "June 23, 1912",
              "full_name": "Alan Turing"
            },
            "gracehop": {
              "date_of_birth": "December 9, 1906",
              "full_name": "Grace Hopper",
            }
          }
        }

     firebaseService.push("/messages",json);
   }
});
