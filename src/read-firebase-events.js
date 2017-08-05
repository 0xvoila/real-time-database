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

var splitPathListFunc = function(eventArray, _callback){
  var splitPathList = [];
  async.each(eventArray, function(eve, eventCallback){
     var absPathArray = eve.abs_path.split("/");
      var eventType = eve.event_type;
      var absPathArrayLen = absPathArray.length;
      for(var i=0;i<absPathArrayLen;i++){
        splitPathList.push({abs_path:absPathArray.join("/"),event_type:eventType});
        absPathArray.pop();
      }
      eventCallback();

  }, function(error,result){
     _callback(null,splitPathList)
  })
}


exports.handler = (event, context, globalCallback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    var eventArray = [];
    async.each(event.Records,function(record, callback){
        console.log(record)
        const payload = new Buffer(record.kinesis.data, 'base64');
        var jsonPayload = JSON.parse(payload);
        var absPathArray = jsonPayload.documents;
        var event_type = jsonPayload.event_type;
        for(var i=0;i<absPathArray.length;i++){
          eventArray.push({abs_path:absPathArray[i].abs_path, event_type:event_type})
        }
        callback(null);
      },function(error, result){
            if(error) throw error;
    })
    splitPathListFunc(eventArray, function(error, splitPathList){
       async.each(splitPathList, function(list, forEachCallback){
            var connection = md5(list.abs_path + list.event_type)
            postUpdates({data:list,connection:connection}, function(error,response, body){
              globalCallback(null)
            })
       });
    })
};




