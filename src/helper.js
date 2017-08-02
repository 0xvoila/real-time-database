var generateId = require('time-uuid');
var request = require('request');


var helper = (function(){

  this.jsonParse = [];

  this.postUpdates = function(path,data){

    //Custom Header pass
    request.post({
        url: 'http://13.126.96.13/updates',
        body: data,
        headers:  { "content-type": "application/json"},
        json: true
      }, function(error, response, body){
      console.log(body);
    });
  },

  this.parseJsonToFindAbsolutePath = function(firebaseReference,json){
    console.log( "json parse is" + this.jsonParse)

    for (var key in json){
      // Check if it is nested json
      if(json[key] != null  && Array.isArray(json[key])){
        var newJson = {}
        for( var i = 0; i < json[key].length; i ++){
          var timestamp = new Date().getTime();
          timestamp = timestamp + i;
          timestamp = timestamp.toString(16);
          newJson[timestamp] = json[key][i];
        }
        this.parseJsonToFindAbsolutePath(firebaseReference + "," + key,newJson);
      }
      else if (json[key] != null && typeof(json[key])=="object"){
       this.parseJsonToFindAbsolutePath(firebaseReference + "," + key,json[key]);
      }
      else {
        this.jsonParse.push({abs_path:firebaseReference + "," + key, element:key, value:json[key]});
      }
    }
    return this.jsonParse;
  }
  return this
})

module.exports = helper

