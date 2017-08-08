'use strict';

var helper = require('./helper.js');
var database = require('./database.js');
var async = require('async');
var request = require('request');
var md5 = require('md5')

var postUpdates = function(firebaseDataChangeLocation, _callback){
   var url = 'http://13.126.96.13/updates/'
            var options = {
              body: firebaseDataChangeLocation,
              json: true,
              url: url,
              method:'post'
            }
            request(options,function(error,response,body){
              _callback(error,response,body);
            });
}

var splitPathListFunc = function(absolutePath, eventType){
  var splitPathList = [];
  var absPathArray = absolutePath.split("/");
  var absPathArrayLen = absPathArray.length;
  for(var i=0;i<absPathArrayLen;i++){
    splitPathList.push({abs_path:absPathArray.join("/"),event_type:eventType});
    absPathArray.pop();
    eventType = "value"
  }
  return splitPathList;
}


exports.handler = (event, context, globalCallback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    var eventArray = [];
    async.each(event.Records,function(record, callback){
        const payload = new Buffer(record.kinesis.data, 'base64');
        var jsonPayload = JSON.parse(payload);
        var absolutePath = jsonPayload.location;
        var event_type = jsonPayload.event_type;
        var absolutePathListArray = splitPathListFunc(absolutePath,event_type)
        async.each(absolutePathListArray, function(list,forEachCallback){
          var connection = md5(list.abs_path + list.event_type)
          postUpdates({data:list,connection:connection}, function(error,response, body){
            forEachCallback(null)
          })
      }, function(error,result){
          callback(null)
      });
    },function(error, result){
            if(error){
              globalCallback(error)
              return
            }
            else{
              globalCallback(null)
            }
    })
};




