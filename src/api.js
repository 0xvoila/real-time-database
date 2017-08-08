'use strict'

var helper = require('./helper.js');
var database = require('./database.js');
var aws = require('aws-sdk');
var {Tree,Node} = require('./tree.js')
var async = require('async');
var circularJSON = require('circular-json');
var kinesis = new aws.Kinesis({region : 'ap-south-1'});
var RedisClient = require('redis')
var client = null;
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'

 var connectToDatabase = function(_callback){
    if(client){
      _callback(null,client);
      return
    }
    else{
        MongoClient.connect(url,function(error,connection){
        if(error){
          console.log(error)
          _callback(error)
          return
        }
        console.log("connecting to database")
        client = connection
        _callback(null,connection);
        return
      })
    }

  }

var x = function(){
  var helperObj = helper();
    var objectId = helperObj.getObjectId()
    console.log(objectId)
    var firebaseReference = "/messages";
  var json = {"name":"amit"}
  var y = {}
  y[objectId] = json
  var v = {}
  v["/messages"] = y
  console.log(v)
}

var testData = function(json){

    var firebaseReference = "/messages";
    var json = {"messages":json}
    var myTree = new Tree()
    var rootNode = new Node()
    rootNode.parent = null;


    myTree.toTree(rootNode,json,[])

    // delete subtree at reference
    async.series([function(callback){
      if(client){
          console.log("connection found")
          callback(null,client)
        }
        else{
          connectToDatabase(callback)
        }
      },function(callback){
        console.log("I am here")
        database.removeSubTree(client,firebaseReference, callback);
      },
      function(callback){
        myTree.depthFirstProcessing(client,rootNode, callback);
      }, function(callback){
        console.log("calling breadthFirstEventTrigger")
        myTree.breadthFirstEventTrigger(rootNode,callback)
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
    var firebaseReference = "/messages";
    var json = {"messages":event.data.body}
    console.log(json)
    var myTree = new Tree()
    var rootNode = new Node()
    rootNode.parent = null;


    myTree.toTree(rootNode,json,[])

    // delete subtree at reference
    async.series([function(callback){
      if(client){
          console.log("connection found")
          callback(null,client)
        }
        else{
          connectToDatabase(callback)
        }
      },function(callback){
        console.log("I am here")
        database.removeSubTree(client,firebaseReference, callback);
      },
      function(callback){
        myTree.depthFirstProcessing(client,rootNode, callback);
      }, function(callback){
        console.log("calling breadthFirstEventTrigger")
        myTree.breadthFirstEventTrigger(rootNode,callback)
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
    var firebaseReference = "/messages";
    var json = {"messages":event.data.body}
    var myTree = new Tree()
    var rootNode = new Node()
    rootNode.parent = null;

    myTree.toTree(rootNode,json,[])

    // delete subtree at reference
    async.series([function(callback){
      if(client){
          console.log("connection found")
          callback(null,client)
        }
        else{
          connectToDatabase(callback)
        }
      },
      function(callback){
        myTree.depthFirstProcessing(client,rootNode, callback);
      }, function(callback){
        console.log("calling breadthFirstEventTrigger")
        myTree.breadthFirstEventTrigger(rootNode,callback)
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

exports.getData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    var firebaseReference = event.data.data_path;
    var queryFilter = event.data.filter || {};
    var limit = event.data.limit || {}

    async.waterfall([function(callback){
      if(client){
          console.log("connection found")
          callback(null,client)
        }
        else{
          connectToDatabase(callback)
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
    var helperObj = helper();
    var objectId = helperObj.getObjectId()
    var firebaseReference = "/messages";
    var json = event.data.body
    var y = {}
    y[objectId] = json
    var v = {}
    v["messages"] = y
    var myTree = new Tree()
    var rootNode = new Node()
    rootNode.parent = null;

    myTree.toTree(rootNode,v,[])

    // delete subtree at reference
    async.series([function(callback){
      if(client){
          console.log("connection found")
          callback(null,client)
        }
        else{
          connectToDatabase(callback)
        }
      },
      function(callback){
        myTree.depthFirstProcessing(client,rootNode, callback);
      }, function(callback){
        console.log("calling breadthFirstEventTrigger")
        myTree.breadthFirstEventTrigger(rootNode,callback)
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

var json = {
          "chat_room_id" : "a",
          "body" : "b"
        }

testData(json)
