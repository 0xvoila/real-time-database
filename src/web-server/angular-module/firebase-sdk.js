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
                  var jsonData = _this.getDataFromRelativePosition(_this_ref.reference,data.data)
                  _this_ref.callback(null,jsonData)
                }
                else if(event == "child_added"){
                  // var jsonData = _this.getDataFromRelativePosition(_this_ref.reference,data.data)
                  // for(var key as jsonData){
                  //   _this_ref.callback(null,jsonData[key])
                  // }

                }
                _this_db.onNSP.emit('on', {absolute_path: _this_ref.reference, event_type :event});
                _this_db.onNSP.on("onData", function(data){
                    $http.post('http://firebase.shawacademy.com/get',  data).then(function(data){
                      if(_this_ref.isReferenceOn){
                        _this_ref.callback(null,data.data);
                      }
                    }, function(error){
                        callback(error)
                    }).catch(function(error){
                      console.log(error)
                    });
                  })
              }, function(error){
                console.log(error)
              }).catch(function(error){
                  console.log(error)
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
            },

            this.getDataFromRelativePosition = function(absolutePath, json){

                var array = absolutePath.split("/")
                if(array.length == 0 ){
                  return json
                }
                else{
                  var ele = array.splice(0,1)
                  ele = ((ele == "")?"/":ele)
                  this.getDataFromRelativePosition(array.join("/"),json[ele])
                }
            } //
          }
        }
     }
  },

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
