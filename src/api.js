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

var setData = function(firebaseReference, json){

  var records = helper.parseJsonToFindAbsolutePath(firebaseReference,json);
  // delete subtree at reference
  async.each(records,function(record,callback){

        async.series([function(callback){

            database.deleteSubTree(firebaseReference, callback);
          },
          function(callback){
            database.insertLeaf(record.abs_path,record.element,record.value, callback);
          }],

          function(error, result){
            if(error) throw error;
            console.log("insertion done")
            callback();
          })
       },

       function(error, result){
        if (error) throw error;
        console.log("all insertion done")
      })
}

var updateData = function(firebaseReference, json){

  var flatTree = helper.parseJsonToFindAbsolutePath(firebaseReference,json);

   for(var i =0; i< flatTree.length;i++){
      var obj = {
        abs_path : flatTree[i].abs_path,
        element : flatTree[i].element,
        value : flatTree[i].value
    }
    console.log(obj);
     database.updateLeaf(obj.abs_path,obj.element,obj.value);
     kinesis.putRecord({Data:JSON.stringify({Data:obj}),StreamName:'firebase-events',PartitionKey:"update_data"},function(err,data){
        if(err) console.log("error in putting data", err);
        else console.log("update data in kinses");
     })
  }
}

var pushData = function(firebaseReference,json){

  var newJson = helper.convertArrayToJson(json);
  var flatTree = helper.parseJsonToFindAbsolutePath(firebaseReference,newJson);

   for(var i =0; i< flatTree.length;i++){
      var obj = {
        abs_path : flatTree[i].abs_path,
        element : flatTree[i].element,
        value : flatTree[i].value
    }
     database.updateLeaf(obj.abs_path,obj.element,obj.value);
     kinesis.putRecord({Data:JSON.stringify({Data:obj}),StreamName:'firebase-events',PartitionKey:"push_data"},function(err,data){
        if(err) console.log("error in putting data", err);
        else console.log("push data in kinses");
     })
  }
}

var createSnapshot = function(){

  database.createSnapshot(",messages,");
}

//createSnapshot();
setData(",messages",json1);
//updateData(",messages",json2);
//pushData(",messages",json3);
