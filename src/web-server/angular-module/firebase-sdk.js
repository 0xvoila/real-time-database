var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http){

  this.onNSP = null;
  this.onceNSP = null;

  this.database = function(database){

     var _this_db = this
     if(!this.onNSP){
      console.log("creating new connection again")
      _this_db.onNSP = io('http://firebase.shawacademy.com/on');
    }
    if(!this.onceNSP){
      console.log("ON socket id is " + _this_db.onNSP.id)
      _this_db.onceNSP = io('http://firebase.shawacademy.com/once');
      console.log("ONCE socket id is " + _this_db.onceNSP.id)
    }
     return new function(){
        this.ref = function(reference){
          var _this_ref = this
          _this_ref.reference = reference
          _this_ref.isReferencOn = false
          _this_ref.callback = null

          return new function(){
            this.on = function(event,callback){
              _this_ref.callback = callback
              _this_ref_isReferenceOn = true
              _this_db.onNSP.emit('on', {absolute_path: _this_ref.reference, event_type :event});
                _this_db.onNSP.on("onData", function(data){
                    $http.post('http://firebase.shawacademy.com/get',  data).then(function(data){
                      if(_this_ref.isReferencOn){
                        _this_ref.callback(null,data.data);
                      }

                    }, function(error){
                        callback(error)
                    });
                  })
            },
            this.once = function(event,callback){
              _this_ref.callback = callback
              _this_ref_isReferenceOn = true
              _this_db.onceNSP.emit('once', {absolute_path: _this_ref.reference, event_type :event});
                _this_db.onceNSP.on("onceData", function(data){
                    $http.post('http://firebase.shawacademy.com/get',  data).then(function(data){
                      _this_ref.off()
                      if(_this_ref.isReferencOn){
                        _this_ref.callback(null,data.data);
                      }

                    }, function(error){
                      callback(error)
                    });
                })
            },

            this.off = function(){
              _this_ref.isReferencOn = false
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
