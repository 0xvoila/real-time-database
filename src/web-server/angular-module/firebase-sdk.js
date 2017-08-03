var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.ref = function(absolutePath, callback){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath });
    socket.on("new_data", function(data){
      var transportObj = {"reference":data}
      $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/get',  transportObj).then(function(data){
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
