var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.onNSP = null;

  this.database = function(database){

     var _this_db = this
     if(!this.onNSP){
      console.log("creating new connection again")
      _this_db.onNSP = io('http://firebase.shawacademy.com/on');
    }
     return new function(){
        this.ref = function(reference){
          var _this_ref = this
          _this_ref.reference = reference
          _this_ref.isReferenceOn = false
          _this_ref.callback = null

          return new function(){
            var _this = this
            this.on = function(event,callback){
              _this_ref.callback = callback
              _this_ref.isReferenceOn = true
              $http.post('http://firebase.shawacademy.com/get',  {data_url:_this_ref.reference}).then(function(data){
                if(event == "value"){
                  _this_ref.callback(data)
                }
                else if(event == "child_added"){
                  _this_ref.callback(data)
                }
                _this_db.onNSP.emit('on', {absolute_path: _this_ref.reference, event_type :event});
                _this_db.onNSP.on("onData", function(data){
                    $http.post('http://firebase.shawacademy.com/get',  data).then(function(data){
                      if(_this_ref.isReferenceOn){
                        _this_ref.callback(null,data.data);
                      }
                    }, function(error){
                        callback(error)
                    });
                  })
              })
            },
            this.once = function(event,callback){
              _this_ref.callback = callback
              _this_ref.isReferenceOn = true
              _this_db.onNSP.emit('on', {absolute_path: _this_ref.reference, event_type :event});
                _this_db.onNSP.on("onData", function(data){
                    $http.post('http://firebase.shawacademy.com/get',  data).then(function(data){
                      if(_this_ref.isReferenceOn){
                        _this.off()
                        _this_ref.callback(null,data.data);
                      }

                    }, function(error){
                      callback(error)
                    });
                })
            },
            this.off = function(){
              _this_ref.isReferenceOn = false
              console.log("switching off reference")
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
