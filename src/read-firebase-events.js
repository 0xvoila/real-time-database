'use strict';

var helper = require('./helper.js');
var database = require('./database.js');

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    event.Records.forEach((record) => {
        // Kinesis data is base64 encoded so decode here
        const payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
        database.createSnapshot(",messages,");
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
};

