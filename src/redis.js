// This module contains database functions
var helper = require('./helper.js');
var request = require('request');
var async = require('async');
var RedisClient = require('redis')
//var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'
//var db = null;

var database = (function(){

  this.bulkWrite = function(connection,records,_callback){

    var insertDocumentArray = [];
    async.waterfall([
          function(callback){
            console.log(records)
            async.each(records, function(record,callback){
              connection.set(record.abs_path,record.value,callback)
            }, function(error,result){
              if(error){
                callback(error)
                return
              }
              else{
                callback(null);
              }
            })
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

  this.deleteSubTree = function(connection, reference,_callback){
    async.waterfall([
      function(callback){
        var firebaseRecord = reference + "*"
        connection.keys(firebaseRecord,function(error, rows){
          for(var i = 0; i < rows.length; i++) {
             connection.del(rows[i])
          }
          callback(null)

        });
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

    var helperObj = helper();

    async.waterfall([
      function(callback){
        async.waterfall([function(callback){
          firebaseRecord = path + "*"
          connection.keys(firebaseRecord, callback)
        }, function(rows, callback){
            var transportResult = {}
            async.each(rows, function(row,callback){
              connection.get(row, function(error, resp){
                transportResult[row] = resp
                callback(null)
              })
            }, function(error, result){
              callback(null,transportResult)
            })
        },function(transportResult, callback){
          var result = helperObj.jsonify(transportResult)
          console.log("json result" + result)
          callback(null,result)
        }], function(error, result){
              callback(null,result)
        })
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
