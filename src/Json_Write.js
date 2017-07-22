var getJson = function(json){

    //your object
  var json = {
      //foo:"bar",
      arr:[1,2,3],
      subo: {
          foo2:{
            foo3 : "bar3"
          }
      }
  };


    var record = parseJsonToFindAbsolutePath(json,"");

}

var parseJsonToFindAbsolutePath =  function (json,absolutePath){

  for (var key in json){
    //console.log(key,json[key]);

    // Check if it is nested json
    if(json[key] != null  && Array.isArray(json[key])){
      // if it is arry then handle convert array into json
      // create a new json
      var newJson = {}

      for( var i = 0; i < json[key].length; i ++){
        var timestamp = Math.floor(Math.random() * 100000);
        newJson[timestamp] = json[key][i];
        //console.log(timestamp);
      }
      parseJsonToFindAbsolutePath(newJson,absolutePath + "/" + key);
    }

    else if (json[key] != null && typeof(json[key])=="object"){
     parseJsonToFindAbsolutePath(json[key],absolutePath + "/" + key);
    }

    else {
      console.log(absolutePath + "/" + key,  json[key]);
    }
  }
}


getJson();
