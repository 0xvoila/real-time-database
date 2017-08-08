'use strict';

var helper = require('./helper.js');
var database = require('./database.js');
var async = require('async');
var circularJSON = require('circular-json')

exports.handler = (event, context, globalCallback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    async.each(event.Records,function(record, callback){
        const payload = new Buffer(record.kinesis.data, 'base64');
        var jsonPayload = circularJSON.parse(payload);
        console.log("payload is")
        console.log(jsonPayload)
        console.log("tree is")
        var tree = jsonPayload.data;
        console.log(tree)
        var rootNode = jsonPayload.root_node
        console.log(rootNode)
        tree.breadthEventTrigger(rootNode,callback)
      }, function(error, result){
        if(error){
          _globalCallback(error)
        }
        else{
          _globalCallback(null,result)
        }
      })
};




