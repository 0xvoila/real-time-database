'use strict';

var helper = require('./helper.js');
var database = require('./database.js');
var async = require('async');
var request = require('request');

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

    async.each(eventArray, function(eve, eventCallback){

      var absPathArray = eve.abs_path.split(",");
      var eventType = eve.event_type;

      var absPathArrayLen = absPathArray.length;
      var splitPathList = [];
      for(var i=0;i<absPathArrayLen;i++){
        splitPathList.push(absPathArray);
        absPathArray.pop();
      }

      async.each(splitPathList, function(absPath, forEachCallback){

          async.waterfall([function(callback){
            database.createSnapshot(absPath,null,null, callback);
          }, function(datasnapshot, callback){
            //console.log(datasnapshot);
            var url = 'http://13.126.96.13/updates/'
            var options = {
              body: datasnapshot,
              json: true,
              url: url
            }
            request.post(options,function(){
              callback(null);
            });
          }], function(error, result){
            if(error) throw error;
            forEachCallback(null);
          })
      }, function(error, result){
        if(error) throw error;
        eventCallback(null);
      }) // async.each close
    }, function(error, result){
      if(error) throw error;
      globalCallback(null);
    })
};

