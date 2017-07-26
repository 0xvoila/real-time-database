var myApp = angular.module('myApp',[]);

myApp.service("firebaseService", function(){
  this.database = null;

  this.database = function(databaseUrl){
    this.database = databaseUrl;
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
    socket.on(absolutePath, function(data){
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

})

var myController = myApp.controller('myController',function(firebaseService){

  firebaseService.database("test").ref(",messages", function(data){
    console.log(data);
  })
});
