'use strict';

var helper = require('./helper.js');
var database = require('./database.js');
var async = require('async');

exports.handler = (event, context, callback) => {

    var pathArray = [];
    async.each(event.Records,function(record, callback){
        const payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');

        //now from payload take out the firebase event , abs_path
        var abs_path = payload.abs_path;
        var event_type = payload.eventName;
        eventArray.push({abs_path:abs_path, event_type:event_type})
    })

    async.each(eventArray, function(event, callback){

      var absPathArray = event.abs_path.split(",");
      var eventType = event.event_type;

      var absPathArrayLen = absPathArray.length;
      var splitPathList = [];
      for(var i=0;i<myPathArrayLen;i++){
        splitPathList.push(absPathArray);
        absPathArray.pop();
      }

      async.each(splitPathList, function(absPath, callback){
          async.waterfall([function(){
            database.createSnapshot(absPath, callback);
          }, function(datasnapshot, callback){
            request.post({datasnapshot:datasnapshot, event_type:event_type});
          }])
      })
    })

};

