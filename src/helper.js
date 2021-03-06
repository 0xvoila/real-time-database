var generateId = require('time-uuid');
var request = require('request');
var ObjectID = require('mongodb').ObjectID;
var request = require('request');


var helper = (function(){

  this.jsonParse = [];


  this.getObjectId = function(){
    var ObjectId = new ObjectID();
    ObjectId = ObjectId.toHexString()
    return ObjectId
  }

  this.postUpdates = function(data, _callback){
   var url = 'http://localhost/updates/'
            var options = {
              body: data,
              json: true,
              url: url,
              method:'post'
            }
            request(options,function(error,response,body){
              _callback(error,response,body);
            });
}

  this.jsonify = function(arrXPath){

    var xPaths = {}
    for(var i=0;i<arrXPath.length;i++){
      var json = arrXPath[i];
      console.log(json.value)
      xPaths[json['absolute_path']] = json.value
    }

    console.log(xPaths)

    var tmp_obj = {};
    var obj = tmp_obj;
    for(key in xPaths) {
      var path = key.split("/");
      path = path.slice(1, path.length);
      for(var x = 0; x < path.length; x++){
        //check if node already exist
        if(tmp_obj[path[x]] == undefined) tmp_obj[path[x]] = {};
        //handle lead node
          if(x == path.length-1)
            tmp_obj[path[x]] = xPaths[key];
          else
            tmp_obj = tmp_obj[path[x]];
      }
      tmp_obj = obj;
    }

    return obj
  }

  this.parseJsonToFindAbsolutePath = function(firebaseReference,json){

    for (var key in json){
      if (json[key] != null && typeof(json[key])=="object"){
       this.parseJsonToFindAbsolutePath(firebaseReference + "/" + key,json[key]);
      }
      else {
        this.jsonParse.push({absolute_path:firebaseReference + "/" + key, element:key, value:json[key]});
      }
    }
    return this.jsonParse;
  }

  this.parseJsonArrayToFindAbsolutePath = function(firebaseReference,ObjectId, json){

    for (var key in json){
      if (json[key] != null && typeof(json[key])=="object"){
       this.parseJsonToFindAbsolutePath(firebaseReference + "/" + ObjectId + "/" + key,json[key]);
      }
      else {
        this.jsonParse.push({abs_path:firebaseReference + "/" + ObjectId + "/" + key, element:key, value:json[key]});
      }
    }
    return this.jsonParse;
  }

  return this
})

module.exports = helper

