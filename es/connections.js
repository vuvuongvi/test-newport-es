const { Client } = require('@elastic/elasticsearch')
const path = require('path')
require('dotenv').config({path:path.resolve(__dirname, '../.env')})
const client = new Client({ 
    node: 'http://localhost:9200',
    apiVersion: 6.7
 })
client.ping({
    requestTimeout: 1000
}, function(error) {
    if(error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});
module.exports = client