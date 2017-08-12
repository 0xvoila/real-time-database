const util = require('util')

var Node = function(){
    this.data = {};
    this.parent = null;
    this.children = []
    this.json = {}

  }

var toJson = function(xPaths){

      this.rootNode = new Node()
      this.rootNode.parent = null

      for(var k=0;k<xPaths.length;k++){
        var v = xPaths[k].abs_path.split("/")
        v.splice(0,1)
        var value = xPaths[k].value;
        createTree(rootNode, v, value)
      }

      depthFirst(rootNode)
      console.log(util.inspect(rootNode.json, false, null))
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



var rootNode = new Node();
rootNode.data.key = "/"
var xPaths = [
  { abs_path: '/messages/598ead4558b3a95d4f41dba8/chat_room_id',element: 'chat_room_id',value: 'goog' },
  { abs_path: '/messages/598ead4558b3a95d4f41dba8/body',element: 'body',value: 'amit' },
  { abs_path: '/messages/598ead4558b3a95d4f41dba8/counter',element: 'counter',value: 59 }

  ]

toJson(xPaths)


