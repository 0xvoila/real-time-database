'use strict'

var helper = require('./helper.js');
var database = require('./redis.js');
var aws = require('aws-sdk');
var async = require('async');
var kinesis = new aws.Kinesis({region : 'ap-south-1'});
var RedisClient = require('redis')
var client = null;

var connectToRedis = function(callback){
  client = RedisClient.createClient(6379,'13.126.96.13')
  client.on("connect", function(){
    console.log("creating connection again")
    callback(null,client);
  })
}

   //your object
  var json1 = {
  "users": {
    "amit": {
      "my_date_of_birth": "June 23, 1912",
      "full_name": "Alan Turing"
    },
    "gracehop": {
      "date_of_birth": "December 9, 1906",
      "full_name": "Grace Hopper",
    }
  }
};



var json2 = {
    "users": {
      "gracehop": {
        "nick_name" : "loosy"
      }
    }
  };

var json3 = {
    name : "amit",
    className : "second"
  };


var testData = function(){

   var firebaseReference = ",messages";
    var helperObj = helper();
    var records = helperObj.parseJsonToFindAbsolutePath(firebaseReference,json1);

    // delete subtree at reference
    async.series([function(callback){
        database.deleteSubTree(connection,firebaseReference, callback);
      },
      function(callback){
        database.bulkWrite(connection,records, callback);
      },
      function(callback){
        var insertDocumentArray = [];
        for(var i=0;i<records.length;i++){
              var firebaseRecord = {abs_path:records[i].abs_path};
              insertDocumentArray.push(firebaseRecord)
            }

        record = {"documents":insertDocumentArray, "event_type":"value"}
        kinesis.putRecord({Data:JSON.stringify(record),StreamName:'firebase-events',PartitionKey:"set_data"},callback);
      }],
      function(error, result){
        if(error) {
          //globalCallback(error);
          return
        }
        else {
          //globalCallback(null);
        }
      })

}
exports.setData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    var firebaseReference = event.data.reference;
    var helperObj = helper();
    var records = helperObj.parseJsonToFindAbsolutePath(firebaseReference,event.data.body);

    // delete subtree at reference
    async.series([function(callback){

        database.deleteSubTree(client,firebaseReference, callback);
      },
      function(callback){

        database.bulkWrite(client,records, callback);
      },
      function(callback){
        var insertDocumentArray = [];
        for(var i=0;i<records.length;i++){
              var firebaseRecord = {abs_path:records[i].abs_path};
              insertDocumentArray.push(firebaseRecord)
            }

        record = {"documents":insertDocumentArray, "event_type":"value"}
        kinesis.putRecord({Data:JSON.stringify(record),StreamName:'firebase-events',PartitionKey:"set_data"},callback);
      }],
      function(error, result){
        if(error) {
          globalCallback(error);
          return
        }
        else {
          globalCallback(null);
        }
      })
};


exports.updateData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    var firebaseReference = event.data.reference;
    var helperObj = helper();
    var records = helperObj.parseJsonToFindAbsolutePath(firebaseReference,event.data.body);

    async.series([function(callback){

        database.bulkWrite(client,records, callback);
      },
      function(callback){
        var insertDocumentArray = [];
        for(var i=0;i<records.length;i++){
              var firebaseRecord = {abs_path:records[i].abs_path};
              insertDocumentArray.push(firebaseRecord)
            }
        record = {"documents":insertDocumentArray, "event_type":"value"}
        kinesis.putRecord({Data:JSON.stringify(record),StreamName:'firebase-events',PartitionKey:"update_data"},callback);
      }],
      function(error, result){
        if(error) {
          globalCallback(error);
          return
        }
        else{
          globalCallback(null);
        }
      })
};

exports.getData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    var firebaseReference = event.data.reference;
    var queryFilter = event.data.filter || {};
    var limit = event.data.limit || {}

    async.waterfall([function(callback){
      if(client){
          console.log("connection found")
          callback(null,client)
        }
        else{
          connectToRedis(callback)
        }
      }, function(result,callback){
            database.createSnapshot(client,firebaseReference, queryFilter, limit, callback)

    }], function(error, result){
        if(error){
          globalCallback(error)
        }
        else{
          globalCallback(null,result)
        }
    })
};

exports.pushData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    var firebaseReference = event.data.reference;
    var helperObj = helper();
    var records = helperObj.parseJsonArrayToFindAbsolutePath(firebaseReference,event.data.body);
    console.log(records);
    async.waterfall([function(callback){
        if(client){
          console.log("connection found")
          callback(null,client)
        }
        else{
          connectToRedis(callback)
        }

      },function(abc,callback){

        database.bulkWrite(client,records, callback);
      },
      function(result, callback){
        var insertDocumentArray = [];
        for(var i=0;i<records.length;i++){
              var firebaseRecord = {abs_path:records[i].abs_path};
              insertDocumentArray.push(firebaseRecord)
            }
        var record = {"documents":insertDocumentArray, "event_type":"child_added"}
        kinesis.putRecord({Data:JSON.stringify(record),StreamName:'firebase-events',PartitionKey:"push_data"},callback);
      }],
      function(error, result){
        if(error) {
          globalCallback(error);
          return
        }
        else{
          globalCallback(null)
        }
      })
};

