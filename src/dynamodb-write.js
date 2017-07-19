var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function(event, context) {

    var route = event.route;
    //console.log("route is " + event.route);
    // /console.log("route is " + event.value);
    var parentArray = route.split("/");
    parentArray = parentArray.pop();
    var parentRoute = "/";
    ((parentArray.length > 0)? parentArray.join() : "/");



    var tableName = "firebase-new";
    dynamodb.putItem({
        "TableName": tableName,
        "Item" : {
            "route": {"S": event.route },
            "value": {"S": event.value },
            "parent":{"S": parent}
        }
    }, function(err, data) {
        if (err) {
            context.done('error','putting item into dynamodb failed: '+err);
        }
        else {
            console.log('great success: '+JSON.stringify(data, null, '  '));
            context.done('K THX BY');
        }
    });
};

// sample event
//{
//  "user": "bart",
//  "msg": "hey otto man"
//}
