var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.socket = null;
  this.database = function(database){

     var _this = this
     if(!this.socket){
      _this.onNSP = io('http://firebase.shawacademy.com/on');
      _this.onceNSP = io('http://firebase.shawacademy.com/once');
     }
     return new function(){
        this.ref = function(reference){
          _this.reference = reference

          return new function(){
            this.on = function(event,callback){
              _this.onNSP.emit('on', {absolute_path: _this.reference, event_type :event});
                _this.onNSP.on("data", function(data){
                    $http.post('http://firebase.shawacademy.com/get',  data).then(function(data){
                      //_this.onNSP.emit("off",{absolute_path:_this.reference, event_type:event})
                      callback(null,data.data);
                    }, function(error){
                      callback(error)
                    });
                  })
            },
            this.once = function(event,callback){
              _this.onceNSP.emit('once', {absolute_path: _this.reference, event_type :event});
                _this.onceNSP.on("data", function(data){
                    $http.post('http://firebase.shawacademy.com/get',  data).then(function(data){
                      _this.onceNSP.emit("off",{absolute_path:_this.reference, event_type:event})
                      callback(null,data.data);
                    }, function(error){
                      callback(error)
                    });
                })
            }
          }
        }
     }
  }

  this.set = function(absolutePath,data,callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://firebase.shawacademy.com/set',  transportObj);
  }

  this.update = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://firebase.shawacademy.com/update',  transportObj);
  }

  this.push = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('http://firebase.shawacademy.com/push',  transportObj);
  }

})
