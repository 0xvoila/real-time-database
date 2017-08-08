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

    console.log("** New Mongo Connection **")
    MongoClient.connect(url,function(error,connection){
      console.log("connecting to database")
      client = connection
      _callback(null,client);
  })
}

exports.pushData = (event, context, globalCallback) => {

    console.log( "client is" + client)

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
          callback(null)
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
