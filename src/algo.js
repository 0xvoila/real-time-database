var Node = function(){
    this.data = {};
    this.parent = null;
    this.children = []
    this.events = {}
  }

var toJson = function(xPaths){

      this.rootNode = new Node()
      this.rootNode.parent = null

      for(var k=0;k<xPaths.length;k++){
        var v = xPaths[k].key.split("/")
        v.splice(0,1)
        var value = xPaths[k].value;
        createTree(rootNode, v, value)
      }

      depthFirst(rootNode)
  }

  var depthFirst = function (rootNode){

    var children = rootNode.children
    var length = children.length
    if(rootNode == null){
      return
    }
    for(var i=0;i<length;i++){

      depthFirst(children[i])
    }
    console.log(rootNode.data)
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
var xPaths = [
                {"key" : "/school/name", "value":"amit"},
                {"key" : "/school/section" , "value" : "5th"}
             ]

toJson(xPaths)


