var helper = require('./helper.js');
var database = require('./database.js');
var aws = require('aws-sdk');
var async = require('async');
var kinesis = new aws.Kinesis({region : 'ap-south-1'});


   //your object
  var json1 = {
  "users": {
    "alanisawesome": {
      "date_of_birth": "June 23, 1912",
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

    var firebaseReference = ",messages";
    var records = new helper().parseJsonToFindAbsolutePath(firebaseReference,event.data);

    // delete subtree at reference
    async.each(records,function(record,callback){

        async.series([function(callback){
            database.deleteSubTree(firebaseReference, callback);
          },
          function(callback){
            database.insertLeaf(record.abs_path,record.element,record.value, callback);
          },
          function(callback){
              record.event_type = 'value';
              kinesis.putRecord({Data:JSON.stringify(record),StreamName:'firebase-events',PartitionKey:"set_data"},callback);
          }],

          function(error, result){
            if(error) {
              console.log("error in mongo")
              throw error;
              callback(error);
            }
            else{
              callback(null);
            }
          })
       },

       function(error, result){
        if (error) {
          console.log("error all done")
          globalCallback(null);
          return
        }
        else {
          globalCallback(null);
          console.log("all done")
        }

      })
};


exports.updateData = (event, context, globalCallback) => {

  console.log("event data is ");
  console.log(event.data);
  var firebaseReference = ",messages";
  var records = new helper().parseJsonToFindAbsolutePath(firebaseReference,event.data);
  // delete subtree at reference
  async.each(records,function(record,callback){

        async.series([function(callback){

            database.updateLeaf(record.abs_path,record.element,record.value, callback);
          },
          function(callback){
              console.log("writing to kinesis")
              record.event_type = 'value';
              kinesis.putRecord({Data:JSON.stringify(record),StreamName:'firebase-events',PartitionKey:"update_data"},callback);
          }],

          function(error, result){
            if(error) throw error;
            console.log("updation done")
            callback();
          })
       },

       function(error, result){
        if (error) throw error;
        console.log("all done")
      })
};


exports.pushData = (event, context, globalCallback) => {

  console.log("event data is ");
  console.log(event.data);
  var firebaseReference = ",messages";
  var helperObj = new helper();
  var records = helperObj.parseJsonToFindAbsolutePath(firebaseReference,event.data);
  // delete subtree at reference
  async.each(records,function(record,callback){

        async.series([function(callback){

            database.updateLeaf(record.abs_path,record.element,record.value, callback);
          },
          function(callback){
              console.log("writing to kinesis")
              record.event_type = 'child_added';
              kinesis.putRecord({Data:JSON.stringify(record),StreamName:'firebase-events',PartitionKey:"child_added"},callback);
          }],

          function(error, result){
            if(error) throw error;
            console.log("updation done")
            callback();
          })
       },

       function(error, result){
        if (error) throw error;
        console.log("all done")
      })
};


