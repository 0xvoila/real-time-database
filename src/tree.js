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
        var v = xPaths[k].absolute_path.split("/")
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

    if(eventJson.self){
      for(var i=0;i<eventJson.self.length;i++){
        var event = eventJson.self[i]
        console.log(node.data.key + " " + event)
        var eventHash = md5(node.data.key + event)
        node.events[event] = {data_url : node.data.key,event:event,connection:eventHash}
      }
    }

    var parentNode = node.parent
    if(eventJson.parent && parentNode){
      for(var i=0;i<eventJson.parent.length;i++){
        var skipEvent = false
        if(eventJson.parent[i] == 'child_added' || eventJson.parent[i] == "child_changed" || eventJson.parent[i] == "child_removed"){
          var event = eventJson.parent[i]

          if(event == "child_added"){
            // remove child_updated and child_removed from grandParent node
            var parentEvents = parentNode.events;
            for(key in parentEvents){
              if(key == "child_changed" || key == "child_removed"){
                delete parentNode.events[key]
              }
            }
          }

          else if (event == "child_removed" || event == "child_changed"){
            // Check if node events already have child_added, if yes then skip these events
            var parentEvents = parentNode.events;
            for(key in parentEvents){
              if(key == "child_added"){
                skipEvent = true
              }
            }
          }

          if(!skipEvent){

            var eventHash = md5(parentNode.data.key + event)
            parentNode.events[event] = {data_url:node.data.key ,event:event, connection:eventHash}
          }

        }
        else {
          var event = eventJson.parent[i]
          console.log(parentNode.data.key + " " + event)
          var eventHash = md5(parentNode.data.key + event)
          parentNode.events[event] = {data_url:parentNode.data.key, event:event, connection:eventHash}
        }

      }
    }

    if(eventJson.grandParents && parentNode && parentNode.parent){
      var grandParentNode = parentNode.parent
      while(grandParentNode != null){
        for(var i=0;i<eventJson.grandParents.length;i++){
          var skipEvent = false
          var event = eventJson.grandParents[i]
           if(event == "child_added"){
            // remove child_updated and child_removed from grandParent node
            var grandParentEvents = grandParentNode.events;
            for(key in grandParentEvents){
              if(key == "child_changed" || key == "child_removed"){
                delete grandParentNode.events[key]
              }
            }
          }

          else if (event == "child_removed" || event == "child_changed"){
            // Check if node events already have child_added, if yes then skip these events
            var grandParentEvents = grandParentNode.events;
            for(key in grandParentEvents){
              if(key == "child_added"){
                skipEvent = true
              }
            }
          }

          if(!skipEvent){

            var eventHash = md5(grandParentNode.data.key + event)
            grandParentNode.events[event] = {data_url:grandParentNode.data.key,event:event, connection:eventHash}
          }
        }
        grandParentNode = grandParentNode.parent;
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
          database.addNode(dbConnection,{absolute_path:node.data.key, value:node.data.value}, callback)

        }, function(callback){
          // Now update parents with firebase events
          var events = {"self":["value"], "parent":["child_added","value"], "grandParents" :["value","child_changed"]}

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
      async.eachOf(child.events, function(item,event,callback){
        var data = {absolute_path:child.data.key , data_url : item.data_url, event:event, connection:item.connection}
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



