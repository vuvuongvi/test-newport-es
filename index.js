const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
const amqp = require('amqplib');
const uuid = require('uuid/v4')
const path = require('path')
require('dotenv').config();
console.log(process.env.RABBITMQ_PRODUCTION)
const amqpCon = amqp.connect('amqp://localhost');
const client = require('./es/connections');
async function createIndexES() {
    client.indices.create({
        index: 'task'
    }, (err, resp, status) => {
        console.log(`create: ${JSON.stringify(resp)}`);
    })
}
async function checkIndexES() {
    client.cluster.health({}, function (err, resp, status) {
        console.log(chalk.blue(`-- Client Health --: ${resp}`));
    })
    let checkIndex = await client.indices.exists({
        index: 'task'
    });
    console.log(checkIndex);
    if (checkIndex !== true) {
        await createIndexES();
    }
}
checkIndexES()
let searchQuery = async (dataSearch) => {
    if (dataSearch) {
        for (let i = 0; i < dataSearch.length; i++) {
            console.log(dataSearch[i]);
            if (dataSearch[i].command === 'search') {
                let result = await client.search({
                    index: 'task',
                    type: 'doc',
                    body: {
                        query: {
                            match: {
                                name: dataSearch[i].name
                            }
                        }
                    }
                })
                return result.body.hits.hits[0]._source
            } else if (dataSearch[i].command === 'add') {
                delete dataSearch[i].command
                let resultCreateIndex = await client.index({
                    index: 'task',
                    id: 1,
                    type: 'doc',
                    body: dataSearch[i]
                });
                return resultCreateIndex.body.created
            }
        }
    }
}

amqpCon
    .then(async (conn) => await conn.createChannel())
    .then(async (ch) => {
        const queue = 'test_pub_sub_rpc';
        await ch.assertQueue(queue, { durable: false });
        await ch.prefetch(1000);
        await ch.consume(queue, async (msg) => {
            const content = await JSON.parse(msg.content);
            ch.ack(msg);
            ch.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(await searchQuery(content))),
                { correlationId: msg.properties.correlationId });
        });
    });