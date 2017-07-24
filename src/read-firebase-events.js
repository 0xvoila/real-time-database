'use strict';

var helper = require('./helper.js');
var database = require('./database.js');
var async = require('async');
var request = require('request');

var postUpdates = function(databasesnapshot, _callback){
   var url = 'http://13.126.96.13/updates/'
            var options = {
              body: databasesnapshot,
              json: true,
              url: url,
              method:'post'
            }
            request(options,function(error,response,body){
              _callback(error,response,body);
            });
}

var splitPathListFunc = function(eventArray, _callback){
  var splitPathList = [];
  async.each(eventArray, function(eve, eventCallback){
     var absPathArray = eve.abs_path.split(",");
      var eventType = eve.event_type;
      var absPathArrayLen = absPathArray.length;
      for(var i=0;i<absPathArrayLen;i++){
        splitPathList.push(absPathArray.join(","));
        absPathArray.pop();
      }
      eventCallback();

  }, function(error,result){
     _callback(null,splitPathList)
  })
}

var createDatabaseSnapShot = function(absPath, _callback){

  console.log(absPath);
  database.createSnapshot(absPath,null,null, function(error, result){
    _callback(null,result);
  });
}

exports.handler = (event, context, globalCallback) => {

    var eventArray = [];
    async.each(event.Records,function(record, callback){
        const payload = new Buffer(record.kinesis.data, 'base64');
        var jsonPayload = JSON.parse(payload);
        var abs_path = jsonPayload.abs_path;
        var event_type = jsonPayload.event_type;
        eventArray.push({abs_path:abs_path, event_type:event_type})
        callback(null);

    }, function(error, result){
      if(error) throw error;
    })

    splitPathListFunc(eventArray, function(error, splitPathList){

       async.each(splitPathList, function(absPath, forEachCallback){
          createDatabaseSnapShot(absPath, function(error, snapshot){
            postUpdates(snapshot, function(error,response, body){
              globalCallback(null)
            })
          })
       });
    })
};




