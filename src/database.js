// This module contains database functions
var helper = require('./helper.js');
var request = require('request');
var async = require('async');


var database = (function(){

  this.isNodeExists = function(connection,query,_callback){
    connection.collection("test").findOne(query, function(error, result){
      if(error){
        _callback(error)
        return
      }
      else if(result){
        _callback(null,true)
        return
      }
      else{
        _callback(null,false)
        return
      }
    })
  }

  this.addNode = function(connection,document,_callback){
    connection.collection("test").insertOne(document, _callback)
  }

  this.updateNode = function(connection,query,document,_callback){
    connection.collection("test").update(query, document, _callback)
  }

  this.bulkWrite = function(connection,tree,_callback){

    tree.depthFirstProcessing(function(error, result){
      _callback()
    });

    var insertDocumentArray = [];

    async.waterfall([
          function(callback){
            for(var i=0;i<records.length;i++){
              var firebaseRecord = {updateOne:{"upsert":true,"filter" : {abs_path:records[i].abs_path}, "update":{abs_path: records[i].abs_path, element: records[i].element , value: records[i].value}}};
              insertDocumentArray.push(firebaseRecord)
            }
            connection.collection("test").bulkWrite(insertDocumentArray,callback);
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

  this.deleteSubTree = function(connection,reference,_callback){
    async.waterfall([
      function(callback){
        var firebaseRecord = { abs_path: new RegExp( '^' + reference)};
        connection.collection("test").deleteMany(firebaseRecord, callback);
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

  this.createSnapshot = function(connection,path,whereQuery, limitLast, _callback){

    async.waterfall([
      function(callback){
        var firebaseRecord = { abs_path: new RegExp("^" + path)};
        connection.collection("test").find(firebaseRecord).snapshot().toArray(callback);
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
