var ObjectID = require('mongodb').ObjectID;
var async = require('async');
var database = require("./database.js")
var helper = require('./helper')
var md5 = require('md5')

var helperObj = new helper()

var getObjectId = function(){
    var ObjectId = new ObjectID();
    ObjectId = ObjectId.toHexString()
    return ObjectId
  }

var Node = function(){
    this.id = getObjectId()
    this.data = {};
    this.parent = null;
    this.children = []
    this.events = {}
  }

module.exports = Node;
