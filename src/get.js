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

exports.getData = (event, context, globalCallback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    var firebaseReference = event.data.data_url;
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
