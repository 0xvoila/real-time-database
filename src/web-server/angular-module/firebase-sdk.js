var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.socket = null;

  this.database = function(database){

     var _this = this
     if(!this.socket){
      _this.socket = io('http://54.83.184.40');
     }
     return new function(){
        this.ref = function(reference){
          _this.reference = reference

          return new function(){
            this.on = function(event,callback){
              _this.socket.emit('join_room', { abs_path: _this.reference, event_type :event});
                _this.socket.on("new_data", function(data){
                    $http.post('http://54.83.184.40/get',  data).then(function(data){
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
