// This module contains database functions
var helper = require('./helper.js');
var request = require('request');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'
var db = null;

var database = (function(){

  this.connection = null;
  MongoClient.connect(url,function(error,connection){
    this.connection = connection
  })


  var connectToDatabase = function(_callback){
    if(this.connection){
      _callback(null,this.connection);
      return
    }
    else{
        MongoClient.connect(url,function(error,connection){
        this.connection = connection
        _callback(null,this.connection);
        return
      })
    }

  }

  this.bulkWrite = function(records,_callback){

    var insertDocumentArray = [];

    async.waterfall([
          function(callback){
            if(this.connection){
              callback(null,this.connection);
            }
            else{
              connectToDatabase(callback);
            }
          },
          function(db,callback){
            for(var i=0;i<records.length;i++){
              var firebaseRecord = {updateOne:{"upsert":true,"filter" : {abs_path:records[i].abs_path}, "update":{abs_path: records[i].abs_path, element: records[i].element , value: records[i].value}}};
              insertDocumentArray.push(firebaseRecord)
            }
            db.collection("test").bulkWrite(insertDocumentArray,callback);
          }
        ],
          function(error,result){
            if (error) {
              return _callback(error)
            }
            return _callback(null,result)
          }
        )
  }

  this.deleteSubTree = function(reference,_callback){
    async.waterfall([
      function(callback){
        if(this.connection){
          callback(null,this.connection);
        }
        else{
          connectToDatabase(callback);
        }
      },
      function(db,callback){
        var firebaseRecord = { abs_path: new RegExp( '^' + reference)};
        db.collection("test").deleteMany(firebaseRecord, callback);
      }
    ],
      function(error,result){
        if (error) {
          _callback(error);
        }
        _callback(null);
      }
    )
  }

  this.createSnapshot = function(path,whereQuery, limitLast, _callback){

    async.waterfall([
      function(callback){
         if(this.connection){
          callback(null,this.connection);
        }
        else{
          connectToDatabase(callback);
        }
      },
      function(db,callback){
        var firebaseRecord = { abs_path: new RegExp("^" + path)};
        db.collection("test").find(firebaseRecord).snapshot().toArray(callback);
      }
    ],
      function(error,result){
         if (error) {
          _callback(error);
        }
        _callback(null,result);
      }
    )
  }

  return this
})()


module.exports = database;
