var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.ref = function(absolutePath, callback){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath });
    socket.on("new_data", function(data){
      callback(data);
    })
    return this
  }

  this.set = function(absolutePath,data,callback){
    data.reference = absolutePath;
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/set',  data);
  }

  this.update = function(absolutePath, data, callback){
    data.reference = absolutePath;
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/update',  data);
  }

  this.push = function(absolutePath, data, callback){
    data.reference = absolutePath;
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/push',  data);
  }

})
