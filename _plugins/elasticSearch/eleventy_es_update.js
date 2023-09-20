const elasticsearch = require('elasticsearch');
const esMappings = require('./client.js')
const esOutput = require('../../es/es-index.json')


const envConfig = require('dotenv').config({path: './_plugins/elasticSearch/.env'});
const ES_PORT = process.env.ES_PORT
const ES_HOST = process.env.ES_HOST
const ES_PASS = process.env.ES_PASSWORD
const ES_USER = process.env.ES_USER
const indexName = 'eleventy_index';

var client = new elasticsearch.Client({
    hosts: [`http://${ES_USER}:${ES_PASS}@localhost:9200`]
});

// Set up ES index + documents
esMappings.setupES(esOutput, indexName, client)