const chalkFactory = require('~lib/chalk')
const fs = require('fs-extra')
const path = require('path')

/**
 * Adds functionality for interracting with elastic search.
 *
 * @param  {Object}  eleventyConfig  The Eleventy configuration instance
 */
module.exports = function (eleventyConfig, options) {

  const outputDir = 'es'
  const outputPath = path.join(outputDir, 'es-index.json')
  const items = [];
  const issueItems = {};
  const newItems = []
  var issue = ""

  const buildIndexEntries = () => (newItems.map(options.document));

  const toJson = (obj) => {
    var cache = [];
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Duplicate reference found, discard key
        if (cache.includes(value)) return;

        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
  }

  // Add an es-index-collection
  eleventyConfig.addCollection("es-index", collectionsApi => {

    // Validate the options
    if (typeof options.collection === 'undefined') {
      throw new Error("collection must be defined in plugin options")
    }
    if (typeof options.document !== 'function') {
      throw new Error("document must be defined as a function in plugin options")
    }

    const collectionToIndex = options.collection;
    items.push(...collectionsApi
      .getAll()
      .filter(page => {
        const { outputs } = page.data
        if (!outputs) return true;

        const pageOutputMatchesType = Array.isArray(outputs) && outputs.includes(collectionToIndex) || outputs === collectionToIndex
        return pageOutputMatchesType
      }));

    //	index[collectionToIndex] = items;
    return items;
  });

  // Listen to the after event to process the results in the html filter.
  eleventyConfig.on('eleventy.after', async () => {
    //  Write the JSON array to the file once everything else is complete.
    const fullPath = path.resolve('.', outputPath);
    console.log(`Writing index file ${fullPath}`);

    var issues = items.forEach(i => {
      const regexpExact = /(\/issue-)([\d]+)(\/)$/
      // Get data for the issue index.md
      if (regexpExact.test(i?.page?.url)) {
        issue = i?.page?.url
        issueItems[issue] = i;
      }
      // Write the correct data to the article object 
      const getIssue = Object.keys(issueItems).filter(iss => {
        if (i?.page?.url.includes(iss)) {
          return iss}})
      if (getIssue) {
        i["issueData"] = issueItems[getIssue]
        newItems.push(i)
      } else {
        i["issueData"] = {}
        newItems.push(i)
      }
    });

    const index = buildIndexEntries();

    try {
      fs.ensureDirSync(path.parse(fullPath).dir);
      fs.writeFileSync(fullPath, toJson(index));
    } catch (error) {
      console.error(error)
    }
  });
};