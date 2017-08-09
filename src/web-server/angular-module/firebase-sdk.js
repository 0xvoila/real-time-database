var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.ref = function(absolutePath,event_type,callback){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath, event_type :event_type});
    socket.on("new_data", function(data){
      $http.post('http://13.126.96.13:80/get',  data).then(function(data){
        callback(null,data.data);
      }, function(error){
        callback(error)
      });
    })
    return this
  }

  this.set = function(absolutePath,data,callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://13.126.96.13:80/set',  transportObj);
  }

  this.update = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://13.126.96.13:80/update',  transportObj);
  }

  this.push = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://13.126.96.13:80/push',  transportObj);
  }

})
