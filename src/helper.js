var generateId = require('time-uuid');
var request = require('request');
var ObjectID = require('mongodb').ObjectID;


var helper = (function(){

  this.jsonParse = [];
  this.ObjectId = new ObjectID();
  this.ObjectId = this.ObjectId.toHexString()

  this.postUpdates = function(path,data){

    //Custom Header pass
    request.post({
        url: 'http://13.126.96.13/updates',
        body: data,
        headers:  { "content-type": "application/json"},
        json: true
      }, function(error, response, body){
    });
  },

  this.jsonify = function(xPaths){
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
        this.jsonParse.push({abs_path:firebaseReference + "/" + key, element:key, value:json[key]});
      }
    }
    return this.jsonParse;
  }

  this.parseJsonArrayToFindAbsolutePath = function(firebaseReference,json){

    for (var key in json){
      if (json[key] != null && typeof(json[key])=="object"){
       this.parseJsonToFindAbsolutePath(firebaseReference + "/" + this.ObjectId + "/" + key,json[key]);
      }
      else {
        this.jsonParse.push({abs_path:firebaseReference + "/" + this.ObjectId + "/" + key, element:key, value:json[key]});
      }
    }
    return this.jsonParse;
  }

  return this
})

module.exports = helper

