# Eleventy Elasticsearch Plugin 

## Installation prerequisites
- If the build is being run locally ensure docker and docker-compose are installed.
- Run `npm i` to install all node dependencies. 

## Instructions for use
### For a localhost deployment
1. Copy the env_template as .env and fill out the required fields.

2. Run `docker-compose up -d` from the _plugins/elasticSearch directory to start the ES container.

3. Build eleventy using `npx eleventy` to generate the es-index.json which can be found in the /es directory.

4. Run `npm run eleventy_es_update` to push the data into the elasticsearch index. Use this command to update the index if any changes are made to the plugin. 

### For an Elastic Cloud deployment
1. Copy the env_template as .env and fill out the required fields.

2. Build eleventy using `npx eleventy` to generate the es-index.json which can be found in the /es directory.

3. Run `npm run eleventy_es_update` to push the data into the elasticsearch index. Use this command to update the index if any changes are made to the plugin. 