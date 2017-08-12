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
    this.json = {}
  }


var Tree = function(){

  this.rootNode = new Node()
  this.rootNode.parent = null;
  var _this = this;



  this.toJson = function(rootNode,xPaths){

      for(var k=0;k<xPaths.length;k++){
        var v = xPaths[k].abs_path.split("/")
        v.splice(0,1)
        var value = xPaths[k].value;
        createTree(rootNode, v, value)
      }

      depthFirst(rootNode)
      return rootNode.json
  }

  var depthFirst = function (rootNode){

    var children = rootNode.children
    var length = children.length
    if(rootNode.children.length == 0){
      //console.log(rootNode)
      var json = {}
      //console.log(rootNode.data.key , rootNode.data.value)
      json[rootNode.data.key] = rootNode.data.value
      return json
    }
    var composeJson = {}
    for(var i=0;i<length;i++){

        var x = depthFirst(children[i])
        //console.log(x)
        for(var key in x){
          composeJson[key] = x[key]
        }

    }
    //console.log(composeJson)
    rootNode.json[rootNode.data.key] = composeJson
    return rootNode.json
  }

  var createTree = function(rootNode, array,value){

    if(array.length == 0 ){
      return
    }
    var children = rootNode.children;
    var len = children.length
    var found = false
    for(var i=0;i<len;i++){
      if(children[i].data.key == array[0]){
        found = true
        array.splice(0,1)
        createTree(children[i],array,value)
        break
      }
    }

    if(found){
      return
    }

    else {
      var newNode = new Node()
      if(array.length == 1){
        newNode.data.key = array[0]
        newNode.data.value = value
      }
      else{

        newNode.data.key = array[0]
        newNode.data.value = null
      }

      rootNode.children.push(newNode)
      array.splice(0,1)
      createTree(newNode, array, value)
    }

  }

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
        var event = eventJson.self[i]
        var eventHash = md5(node.data.key + event)
        node.events[eventHash] = {data_url : node.data.key,event:event}
      }
    }

    var parentNode = node.parent
    if(eventJson.parent && parentNode){
      for(var i=0;i<eventJson.parent.length;i++){
        if(eventJson.parent[i] == 'child_added' || eventJson.parent[i] == "child_changed" || eventJson.parent[i] == "child_removed"){
          var event = eventJson.parent[i]
          var eventHash = md5(parentNode.data.key + event)
          parentNode.events[eventHash] = {data_url:node.data.key ,event:event}
        }
        else {
          var event = eventJson.parent[i]
          var eventHash = md5(parentNode.data.key + event)
          parentNode.events[eventHash] = {data_url:parentNode.data.key, event:event}
        }

      }
    }

    if(parentNode && parentNode.parent){
      var grandParent = parentNode.parent
      while(grandParent != null){
        for(var i=0;i<eventJson.length;i++){
          var event = eventJson.grandParent[i]
          var eventHash = md5(grandParent.data.key + event)
          grandParent.events[eventHash] = {data_url:grandParent.data.key,event:event}
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
          database.updateNode(dbConnection,{absolute_path:node.data.key},{absolute_path:node.data.key, value:node.data.value}, callback)

        }, function(callback){
           // Now update parents with firebase events
          var events = {"self":["value"], "parent":["value","child_changed"], "grandParents" :["value", "child_changed"]}
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

  this.breadthFirstEventTrigger = function(node, _callback){

    async.each(node.children, function(child,callback){
      async.eachOf(child.events, function(item,hashKey,callback){
        var data = {absolute_path:child.data.key , data_url : item.data_url, event:item.event, connection:hashKey}
        helperObj.postUpdates(data,callback)
      },function(error, result){
        if(error) throw error
        else {
          callback()
        }
      })
    }, function(error, result){
      if(error){
        throw error
        _callback(error)
      }
      else{
        async.each(node.children, function(child,callback){
            _this.breadthFirstEventTrigger(child, callback)
        }, function(error, result){
            if(error){
              _callback(error)
            }
            else{
              _callback(null,result)
            }
        })
      }
    })
  }
}

module.exports = Tree



