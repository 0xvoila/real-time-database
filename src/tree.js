var ObjectID = require('mongodb').ObjectID;
var async = require('async');
var database = require("./database.js")

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
    this.events = []
  }


var Tree = function(){

  this.rootNode = new Node()
  this.rootNode.parent = null;
  var _this = this;

  this.toTree = function(node, json, pathKeys){
    // console.log(node)
    // console.log(json)
    for(var key in json){

      var newNode = new Node()
      newNode.parent = node;

      if(typeof(json[key]) == "object"){
        newNode.data.key = pathKeys.join("") + "/" +  key
        newNode.data.value = null
      }
      else {
        newNode.data.key = pathKeys.join("") +  "/" + key ;
        newNode.data.value = json[key]
      }

      node.children.push(newNode)
      node = newNode;

      if(typeof(json[key]) == "object"){
        pathKeys.push( "/" + key)
        this.toTree(node,json[key],pathKeys)
      }
    }

    pathKeys.pop()

  }

  this.addChildNode = function(parentNode, childNode){
    parentNode.children.push(childNode);
    childNode.parent = parentNode;
    return this
  },

  this.setEvents = function(node,eventJson, _callback){
    console.log("set events")
    if(eventJson.self){
      for(var i=0;i<eventJson.self.length;i++){
        node.events.push(eventJson.self[i])
      }

    }

    var parentNode = node.parent
    if(eventJson.parent && parentNode){
      for(var i=0;i<eventJson.parent.length;i++){
        parentNode.events.push(eventJson.parent[i])
      }
    }

    if(parentNode && parentNode.parent){
      var grandParent = parentNode.parent
      while(grandParent != null){
        for(var i=0;i<eventJson.length;i++){
          grandParent.event.push(eventJson.grandParent[i])
        }
        grandParent = grandParent.parent;
      }
    }

    _callback(null)
    return
  },

  this.traverseNodeChildren = function(node){

    for(var i=0; i<node.children.length;i++){
    }
  }

  this.hasNodeParent = function(node){

      if(node.parent){
        return true
      }
      else{
        return false;
      }
  }

  this.processNode = function(dbConnection,node, _callback){

    var absolutePath = node.data.key
    var nodeValue = node.data.value

    async.waterfall([function(callback){
      database.isNodeExists(dbConnection,{absolute_path:node.data.key}, callback)

    }, function(result,callback){
      if(result){
        console.log("XXXX")
        // it means it exists then do upate and trigger events
        async.series([function(callback){
          database.updateNode(dbConnection,{absolute_path:node.data.key, value:node.data.value}, callback)

        }, function(callback){
           // Now update parents with firebase events
          var events = {"self":["value"], "parent":["value","child_updated"], "grandParents" :["value", "child_updated"]}
          _this.setEvents(node,events,callback)
        }], function(error, result){
              if(error){
                callback(error)
                return
              }
              else{
                callback(null,result)
              }
        })
      }

      else{
        async.series([function(callback){
          // insert into database
          console.log("adding node to database")
          database.addNode(dbConnection,{absolute_path:node.data.key, value:node.data.value}, callback)

        }, function(callback){
          // Now update parents with firebase events
          var events = {"self":["value"], "parent":["child_added","value"], "grandParents" :["value","child_updated"]}
          _this.setEvents(node,events,callback)

        }], function(error, result){
           if(error){
            callback(error)
            return
          }
          else{
            callback(null,result)
          }

        })
      }
    }], function(error, result){
      if(error){
        _callback(error)
        return
      }
      else{
        _callback(null,result)
      }
    })
  }

  this.depthFirstProcessing = function(dbConnection, node, _callback){

    async.series([function(callback){

      _this.processNode(dbConnection, node, callback)

    }, function(callback){

        async.each(node.children, function(child, callback){
          _this.depthFirstProcessing(dbConnection,child, callback)

        }, function(error, result){
              if (error){
                callback(error)
              }
              else{
                callback(null,result)
              }
        })

    }], function(error, result){
          if(error){
            _callback(error)
          }
          else{
            _callback(null,result)
          }
    })

    return
  }

  this.breadthFirst = function(node){

    for(var i =0; i< node.children.length;i++){
        console.log(node.children[i].events)
    }
    for(var i =0; i< node.children.length;i++){
        this.breadthFirst(node.children[i])
    }
    return

  }
}


// var myTree = new Tree()
// var rootNode = new Node()
// rootNode.parent = null;
// myTree.toTree(rootNode,{"name":"amit"},[])

module.exports = {
  Node : Node,
  Tree : Tree
}



