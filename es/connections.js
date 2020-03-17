const { Client } = require('@elastic/elasticsearch')
require('dotenv').config({path:path.resolve(__dirname, '../.env')})
console.log(process.env.ES_LOCAL);
const client = new Client({ 
    node: process.env.ES_PRODUCTION,
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