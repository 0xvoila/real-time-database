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

