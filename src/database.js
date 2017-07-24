// This module contains database functions
var helper = require('./helper.js');
var request = require('request');
var async = require('async');
var request = require('request');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'
var db = null;

exports.insertLeaf = function(path,element,value,_callback){

  async.waterfall([
    function(callback){
      MongoClient.connect(url,callback);
    },
    function(db,callback){
      var firebaseRecord = { abs_path: path, element: element , value: value };
      db.collection("test").insertOne(firebaseRecord, callback);
      db.close();
    }
  ],
    function(error,result){
      if (error) {
        return _callback(error)
      }
      return _callback(null,result)
    }
  )
};



exports.deleteSubTree = function(reference, _callback){

async.waterfall([
    function(callback){
      MongoClient.connect(url,callback);
    },
    function(db,callback){

      var firebaseRecord = { abs_path: new RegExp( '^' + reference)};
      db.collection("test").remove(firebaseRecord, callback);
      db.close();
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

exports.updateLeaf = function(path,element,value){
  async.waterfall([
    function(callback){
      MongoClient.connect(url,callback);
    },
    function(db,callback){
      var queryObj = {abs_path: path, element:element}
      var firebaseRecord = { abs_path: path, element: element , value: value };
      db.collection("test").updateOne(queryObj,firebaseRecord, {upsert:true} ,callback);
      db.close();
    }
  ],
    function(error,result){
      if (error) throw error;
    }
  )
}

exports.createSnapshot = function(path){

  async.waterfall([
    function(callback){
      MongoClient.connect(url,callback);
    },

    function(db,callback){
      var firebaseRecord = { abs_path: new RegExp("^" + path)};
      db.collection("test").find(firebaseRecord).snapshot().toArray(callback);
      db.close();
    }
  ],
    function(error,result){
      if (error) throw error;
      return result;
    }
  )

  // MongoClient.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var findObj = { abs_path: new RegExp("^" + path)};
  //   console.log(findObj);
  //   db.collection("test").find(findObj).snapshot().toArray(function(err, res) {
  //     if (err) throw err;
  //     console.log(res);
  //     helper.postUpdates(path,{"body":res});
  //     db.close();
  //   });
  // });
}

