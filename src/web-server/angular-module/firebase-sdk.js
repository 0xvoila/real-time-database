var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){
  this.databaseUrl = null;

  this.database = function(databaseUrl){
    this.databaseUrl = databaseUrl;
    return this.ref;
  }

  this.ref = function(absolutePath){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath });
    return this.child
  }

  this.ref = function(absolutePath, callback){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath });
    socket.on("new_data", function(data){
      callback(data);
    })
    return this
  }

  this.child = function(childPath){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath + childPath});
    return this.child
  }

  this.child = function(childPath){
    var socket = io('http://13.126.96.13:80');
    socket.emit('join_room', { abs_path: absolutePath + childPath});
    socket.on(absolutePath + childPath, function(data){
      callback(data);
    })
    return this
  }

  this.set = function(absolutePath,data,callback){
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/set',  data);
  }

  this.update = function(absolutePath, data, callback){
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/update',  data);
  }

  this.push = function(absolutePath, data, callback){
    $http.post('https://hdc1vqp7y0.execute-api.ap-south-1.amazonaws.com/prod/push',  data);
  }

})
