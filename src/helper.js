var jsonParse = [];
var generateId = require('time-uuid');
var request = require('request');

exports.getImmediateParent = function(path){
  var pathArray = path.split("/");
  pathArray.pop();
  return pathArray.join("/");
}

exports.getChildKeyFromPath = function(path){
  var pathArray = path.split("/");
  var childKey = pathArray.pop();
  return childKey;

}

exports.postUpdates = function(path,data){

    //Custom Header pass
    request.post({
      url: 'http://13.126.96.13/updates',
      body: data,
      headers:  { "content-type": "application/json"},
      json: true
    }, function(error, response, body){
    console.log(body);
  });
}

exports.parseJsonToFindAbsolutePath =  function (firebaseReference,json){

  for (var key in json){
    //console.log(key,json[key]);

    // Check if it is nested json
    if(json[key] != null  && Array.isArray(json[key])){
      // if it is arry then handle convert array into json
      // create a new json
      var newJson = {}

      for( var i = 0; i < json[key].length; i ++){
        var timestamp = Math.floor(Math.random() * 100000);
        newJson[timestamp] = json[key][i];
        //console.log(timestamp);
      }
      module.exports.parseJsonToFindAbsolutePath(firebaseReference + "," + key,newJson);
    }

    else if (json[key] != null && typeof(json[key])=="object"){
     module.exports.parseJsonToFindAbsolutePath(firebaseReference + "," + key,json[key]);
    }

    else {

      jsonParse.push({abs_path:firebaseReference, element:key, value:json[key]});
    }
  }

  return jsonParse;
}

exports.convertArrayToJson = function(json){

  var newJson = {};
  // now generate firebase key
  var myId = generateId();
  newJson[myId] = json;
  return newJson;
}

