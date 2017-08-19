var myApp = angular.module('myApp');

myApp.service("firebaseService", function($http,md5){

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
              $http.post('https://firebase.shawacademy.com/get',  {data_url:_this_ref.reference}).then(function(data){
                if(event == "value"){
                  var jsonData = _this.getDataFromRelativePosition(_this_ref.reference,data.data)
                  _this_ref.callback(null,jsonData)
                }
                else if(event == "child_added" || event == "child_changed"){
                  var jsonData = _this.getDataFromRelativePosition(_this_ref.reference,data.data)
                  for(var key in jsonData){
                      var json = {}
                      json[key] = jsonData[key]
                    _this_ref.callback(null,json)
                  }

                }
                _this_db.onNSP.emit('on', {absolute_path: _this_ref.reference, event_type :event});
                var connection = md5.createHash(_this_ref.reference + event)
                _this_db.onNSP.on(connection, function(data){
                    $http.post('https://firebase.shawacademy.com/get',  data).then(function(data){
                      var jsonData = _this.getDataFromRelativePosition(_this_ref.reference,data.data)
                      if(_this_ref.isReferenceOn){
                        _this_ref.callback(null,jsonData);
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
                    $http.post('https://firebase.shawacademy.com/get',  data).then(function(data){
                      var jsonData = _this.getDataFromRelativePosition(_this_ref.reference,data.data)
                      if(_this_ref.isReferenceOn){
                        _this.off()
                        _this_ref.callback(null,jsonData);
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

                if(angular.equals(json, {})){
                  return json
                }
                var array = absolutePath.split("/")
                var myJson = null
                for(var i=0;i<array.length;i++){
                  if(i == 0){
                    array[i] = "/"
                  }
                  myJson = json[array[i]]
                  json = myJson
                }

                return myJson
            } //
          }
        }
     }
  },

  this.set = function(absolutePath,data,callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('https://firebase.shawacademy.com/set',  transportObj);
  }

  this.update = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('https://firebase.shawacademy.com/update',  transportObj);
  }

  this.push = function(absolutePath, data, callback){
    var transportObj = {reference:absolutePath, body:data};
    $http.post('https://firebase.shawacademy.com/push',  transportObj);
  }

})
