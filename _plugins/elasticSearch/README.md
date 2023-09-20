# Eleventy Elasticsearch Plugin 

## Prerequisites
- Ensure docker and docker-compose is installed.
- Run `npm i` to install all node dependencies. 

## Installation
1. Copy the env_template as .env and fill out all fields.

2. Run `docker-compose up -d` from the _plugins/elasticSearch directory to start the ES container.

3. Build eleventy using `npx eleventy` to generate the es-index.json which can be found in the /es directory.

4. Run `npm run eleventy_es_update` to push the data into the elasticsearch index. Use this command to update the index if any changes are made to the plugin. 