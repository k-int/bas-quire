const chalkFactory = require('~lib/chalk')
const fs = require('fs-extra')
const path = require('path');

/**
 * Adds functionality for interracting with elastic search.
 *
 * @param  {Object}  eleventyConfig  The Eleventy configuration instance
 */
module.exports = function (eleventyConfig, options) {

  const outputDir = 'es'
  const outputPath = path.join(outputDir, 'es-index.json')
  const items = [];
  var slideData = {};
  var issueItems = {};

  const buildIndexEntries = () => (items.map(options.document));

  const toJson = (obj) => {
    var cache = [];
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Duplicate reference found, discard key
        // if (cache.includes(value)) return; 
        // COMMENTED OUT to allow for duplicates for crosswalk structure

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

    // Get additional issue + slides data ready to attach to articles
    items.forEach(i => {
      // Get relevant slides and attach to article
      const splitKey = i.data.key.split("/")
      const articleKey = [splitKey[0], splitKey[1]].join("/")
      if (splitKey[2] && splitKey[2].includes("slide")) {
        if (!(slideData[articleKey])) {
          slideData[articleKey] = []
        }
        slideData[articleKey].push(i)
      }
      // Get data for the issue index.md
      const regexpExact = /(issue-)([\d]+)$/
      if (regexpExact.test(i.data.key)) {
        var issue = i.data.key
        issueItems[issue] = i;
      }
    })


    // Attach relevant additional data into articles
    items.forEach(i => {
      const getIssue = Object.keys(issueItems).filter(iss => {
        if (i?.data?.key?.includes(iss)) {
          return iss
        }
      })
      if (getIssue) {
        i["issueData"] = issueItems[getIssue]
      } else {
        i["issueData"] = {}
      }
      const getSlides = Object.keys(slideData).filter(slide => {
        if (i?.data?.key == slide) {
          return slide
        }
      })
      if (getSlides) {
        i["slideData"] = slideData[getSlides]
      } else {
        i["slideData"] = {}
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