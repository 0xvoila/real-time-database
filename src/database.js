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
    console.log("caching new connection")
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
        console.log("in db connection, creating new connection")
        _callback(null,this.connection);
        return
      })
    }

  }

  this.insertLeaf = function(path,element,value,_callback){

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
        var firebaseRecord = { abs_path: path, element: element , value: value };
        db.collection("test").insertOne(firebaseRecord, callback);
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
    console.log( "deleting references" + reference)
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
        db.collection("test").remove(firebaseRecord, callback);
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

  this.updateLeaf = function(path,element,value, _callback){
    async.waterfall([
      function(callback){
        if(this.connection){
          console.log("connection already");
          callback(null,this.connection);
        }
        else{
          connectToDatabase(callback);
        }
      },
      function(db,callback){
        var queryObj = {abs_path: path, element:element}
        var firebaseRecord = { abs_path: path, element: element , value: value };
        db.collection("test").updateOne(queryObj,firebaseRecord, {upsert:true} ,callback)
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

  this.createSnapshot = function(path,whereQuery, limitLast, _callback){

    async.waterfall([
      function(callback){
         if(this.connection){
          console.log("connection already");
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
