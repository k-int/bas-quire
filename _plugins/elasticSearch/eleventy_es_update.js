const { Client, errors } = require('@elastic/elasticsearch')
const esMappings = require('./client.js')
const esOutput = require('../../es/es-index.json')

const envConfig = require('dotenv').config({ path: './_plugins/elasticSearch/.env' });
const ES_PORT = process.env.ES_PORT
const ES_HOST = process.env.ES_HOST
const ES_PASS = process.env.ES_PASSWORD
const ES_USER = process.env.ES_USER
const ES_CLOUD_ID = process.env.ES_CLOUD_ID
const baseIndexName = process.env.ES_INDEX_NAME


// For use with localhost
// var client = new Client({
//     node: `http://${ES_USER}:${ES_PASS}@localhost:9200`
// });


// For use with ElasticCloud
// const client = new Client({
//     cloud: {
//         id: ES_CLOUD_ID
//     },
//     auth: {
//         username: ES_USER,
//         password: ES_PASS
//     }
// })


// Ping ES client first
client.ping({}, { requestTimeout: 1000 })
    .then(() => {
        console.log('Elasticsearch client connected!\n');
        // Set up ES index + documents
        esMappings.setupES(esOutput, baseIndexName, client)
    })
    .catch((err) => {
        console.log('Elasticsearch client unavailable:\n', { error: err });
    });

  

