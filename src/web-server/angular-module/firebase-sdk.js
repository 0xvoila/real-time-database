var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.ref = function(absolutePath,event_type,callback){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath, eventType :event_type});
    socket.on("new_data", function(data){
      $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/get',  data).then(function(data){
        callback(null,data.data);
      }, function(error){
        callback(error)
      });
    })
    return this
  }

  this.set = function(absolutePath,data,callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/set',  transportObj);
  }

  this.update = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/update',  transportObj);
  }

  this.push = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/push',  transportObj);
  }

})
