var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.socket = null;

   this.ref = function(absolutePath,event_type,callback){

    if(!this.socket){
      console.log("connection already exists")
      this.database()
    }

    this.socket.emit('join_room', { abs_path: absolutePath, event_type :event_type});
    this.socket.on("new_data", function(data){
    $http.post('http://54.83.184.40/get',  data).then(function(data){
      callback(null,data.data);
    }, function(error){
      callback(error)
    });
  })
    return this
  }

  this.database = function(){

     if(!this.socket){
      this.socket = io('http://54.83.184.40');
     }

     return this.ref
  }

  this.set = function(absolutePath,data,callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://54.83.184.40/set',  transportObj);
  }

  this.update = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://54.83.184.40/update',  transportObj);
  }

  this.push = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://54.83.184.40/push',  transportObj);
  }

})
