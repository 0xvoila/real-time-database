var helper = require('./helper.js');
var database = require('./database.js');
var aws = require('aws-sdk');
var async = require('async');
var kinesis = new aws.Kinesis({region : 'ap-south-1'});


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


exports.setData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    var firebaseReference = event.data.reference;
    console.log(firebaseReference)
    console.log(event.data.body)
    var helperObj = helper();
    var records = helperObj.parseJsonToFindAbsolutePath(firebaseReference,event.data.body);

    // delete subtree at reference
    async.series([function(callback){
        database.deleteSubTree(firebaseReference, callback);
      },
      function(callback){
        database.bulkWrite(records, callback);
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

        database.bulkWrite(records, callback);
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

    database.createSnapshot(firebaseReference, queryFilter, limit, function(error,result){

      if(error){
          globalCallback(error)
          return
      }

      globalCallback(null,result)
      return result;
    })

};

exports.pushData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    var firebaseReference = event.data.reference;
    var helperObj = helper();
    var records = helperObj.parseJsonToFindAbsolutePath(firebaseReference,event.data.body);

    async.series([function(callback){

        database.bulkWrite(records, callback);
      },
      function(callback){
        var insertDocumentArray = [];
        for(var i=0;i<records.length;i++){
              var firebaseRecord = {abs_path:records[i].abs_path};
              insertDocumentArray.push(firebaseRecord)
            }
        record = {"documents":insertDocumentArray, "event_type":"child_added"}
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
