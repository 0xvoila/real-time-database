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

    var options ={
          server: {
                    socketOptions: {keepAlive: 1}
                  },
          poolSize:100,
          replset: {
                    rs_name: 'voila-cluster-shard-0',
                    socketOptions: {keepAlive: 1}
                  }
    }

    MongoClient.connect(url,options,function(error,connection){
      if(error){
        console.log(error)
        _callback(error)
      }
      else{

        client = connection
        _callback(null,client);
      }

  })
}

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
          callback(null)
        }
        else{
          connectToDatabase(callback)
        }
      },
      function(callback){
        myTree.depthFirstProcessing(client,rootNode, callback);
      }, function(callback){
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
