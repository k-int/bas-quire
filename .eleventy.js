require('module-alias/register')

const copy = require('rollup-plugin-copy')
const fs = require('fs-extra')
const packageJSON = require('./package.json');
const path = require('path')
const scss = require('rollup-plugin-scss')

/**
 * Quire features are implemented as Eleventy plugins
 */
const {
  EleventyHtmlBasePlugin,
  EleventyRenderPlugin
} = require('@11ty/eleventy')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')
const citationsPlugin = require('~plugins/citations')
const collectionsPlugin = require('~plugins/collections')
const componentsPlugin = require('~plugins/components')
const dataExtensionsPlugin = require('~plugins/dataExtensions')
const directoryOutputPlugin = require('@11ty/eleventy-plugin-directory-output')
const figuresPlugin = require('~plugins/figures')
const filtersPlugin = require('~plugins/filters')
const frontmatterPlugin = require('~plugins/frontmatter')
const globalDataPlugin = require('~plugins/globalData')
const i18nPlugin = require('~plugins/i18n')
const lintersPlugin = require('~plugins/linters')
const markdownPlugin = require('~plugins/markdown')
const navigationPlugin = require('@11ty/eleventy-navigation')
const pluginWebc = require('@11ty/eleventy-plugin-webc')
const searchPlugin = require('~plugins/search')
const shortcodesPlugin = require('~plugins/shortcodes')
const syntaxHighlightPlugin = require('@11ty/eleventy-plugin-syntaxhighlight')
const transformsPlugin = require('~plugins/transforms')
const elasticSearch = require('~plugins/elasticSearch')

const inputDir = 'content'
const outputDir = '_site'
const publicDir = 'public'

/**
 * Eleventy configuration
 * @see {@link https://www.11ty.dev/docs/config/ Configuring 11ty}
 *
 * @param      {Object}  base eleventy configuration
 * @return     {Object}  A modified eleventy configuation
 */
module.exports = function (eleventyConfig) {
  /**
   * Override addPassthroughCopy to use _absolute_ system paths.
   * @see https://www.11ty.dev/docs/copy/#passthrough-file-copy
   * Nota bene: Eleventy addPassthroughCopy assumes paths are _relative_
   * to the `config` file however the quire-cli separates 11ty from the
   * project directory (`input`) and needs to use absolute system paths.
   */
  // @TODO Fix path resolution issue, disabling for now
  // const addPassthroughCopy = eleventyConfig.addPassthroughCopy.bind(eleventyConfig)
  //
  // eleventyConfig.addPassthroughCopy = (entry) => {
  //   if (typeof entry === 'string') {
  //     const filePath = path.resolve(entry)
  //     console.debug('[11ty:config] passthrough copy %s', filePath)
  //     return addPassthroughCopy(filePath, { expand: true })
  //   } else {
  //     console.debug('[11ty:config] passthrough copy %o', entry)
  //     entry = Object.fromEntries(
  //       Object.entries(entry).map(([ src, dest ]) => {
  //         return [
  //           path.join(__dirname, src),
  //           path.resolve(path.join(outputDir, dest))
  //         ]
  //       })
  //     )
  //     console.debug('[11ty:config] passthrough copy %o', entry)
  //     return addPassthroughCopy(entry, { expand: true })
  //   }
  // }

  eleventyConfig.addGlobalData('application', {
    name: 'Quire',
    version: packageJSON.version
  })

  /**
   * Ignore README files when processing templates
   * @see {@link https://www.11ty.dev/docs/ignores/ Ignoring Template Files }
   */
  eleventyConfig.ignores.add('**/README.md')

  /**
   * Configure the Liquid template engine
   * @see https://www.11ty.dev/docs/languages/liquid/#liquid-options
   * @see https://github.com/11ty/eleventy/blob/master/src/Engines/Liquid.js
   *
   * @property {boolean} [dynamicPartials=false]
   * @property {boolean} [strictFilters=false]
   */
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: true
  })

  /**
   * Configure build output
   * @see https://www.11ty.dev/docs/plugins/directory-output/#directory-output
   */
  eleventyConfig.setQuietMode(true)
  eleventyConfig.addPlugin(directoryOutputPlugin)

  /**
   * @see https://www.11ty.dev/docs/plugins/html-base/
   */
  // eleventyConfig.addPlugin(EleventyHtmlBasePlugin, {
  //   baseHref: eleventyConfig.pathPrefix
  // })

  /**
   * Plugins are loaded in order of the `addPlugin` statements,
   * plugins that mutate globalData must be added before other plugins
   */
  eleventyConfig.addPlugin(dataExtensionsPlugin)
  eleventyConfig.addPlugin(globalDataPlugin)
  eleventyConfig.addPlugin(i18nPlugin)
  eleventyConfig.addPlugin(figuresPlugin)

  /**
   * Load plugin for custom configuration of the markdown library
   */
  eleventyConfig.addPlugin(markdownPlugin)

  /**
   * Add collections
   */
  const collections = collectionsPlugin(eleventyConfig)

  /**
   * Load plugins for the Quire template shortcodes and filters
   */
  eleventyConfig.addPlugin(componentsPlugin, collections)
  eleventyConfig.addPlugin(filtersPlugin)
  eleventyConfig.addPlugin(frontmatterPlugin)
  eleventyConfig.addPlugin(shortcodesPlugin, collections)

  /**
   * Load additional plugins used for Quire projects
   */
  eleventyConfig.addPlugin(citationsPlugin)
  eleventyConfig.addPlugin(navigationPlugin)
  eleventyConfig.addPlugin(searchPlugin, collections)

  eleventyConfig.addPlugin(syntaxHighlightPlugin)

  /**
   * Add shortcodes to render an Eleventy template inside of another template,
   * allowing JavaScript, Liquid, and Nunjucks templates to be freely mixed.
   * @see {@link https://www.11ty.dev/docs/_plugins/render/}
   */
  eleventyConfig.addPlugin(EleventyRenderPlugin)

  /**
   * Add plugin for WebC support
   * @see https://www.11ty.dev/docs/languages/webc/#installation
   *
   * @typedef {PluginWebcOptions}
   * @property {String} components - Glob pattern for no-import global components
   * @property {Object} transformData - Additional global data for WebC transform
   * @property {Boolean} useTransform - Use WebC transform to process all HTML output
   */
  eleventyConfig.addPlugin(pluginWebc, {
    components: '_includes/components/**/*.webc',
    transformData: {},
    useTransform: false,
  })

  /**
   * Register a plugin to run linters on input templates
   * Nota bene: linters are run *before* applying layouts
   */
  eleventyConfig.addPlugin(lintersPlugin)

  /**
   * Register plugin to run tranforms on build output
   */
  eleventyConfig.addPlugin(transformsPlugin, collections)

  /**
   * Use Vite to bundle JavaScript
   * @see https://github.com/11ty/eleventy-plugin-vite
   *
   * Runs Vite as Middleware in the Eleventy Dev Server
   * Runs Vite build to postprocess the Eleventy build output
   */
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: '.11ty-vite',
    viteOptions: {
      publicDir: process.env.ELEVENTY_ENV === 'production'
        ? publicDir
        : false,
      /**
       * @see https://vitejs.dev/config/#build-options
       */
      root: outputDir,
      build: {
        assetsDir: '_assets',
        emptyOutDir: process.env.ELEVENTY_ENV !== 'production',
        manifest: true,
        mode: 'production',
        outDir: outputDir,
        rollupOptions: {
          output: {
            assetFileNames: ({ name }) => {
              const fullFilePathSegments = name.split('/').slice(0, -1)
              let filePath = '_assets/';
              ['_assets', 'node_modules'].forEach((assetDir) => {
                if (name.includes(assetDir)) {
                  filePath +=
                    fullFilePathSegments
                      .slice(fullFilePathSegments.indexOf(assetDir) + 1)
                      .join('/') + '/'
                }
              })
              return `${filePath}[name][extname]`
            }
          },
          plugins: [
            copy({
              targets: [
                {
                  src: 'public/*',
                  dest: outputDir,
                },
                {
                  src: path.join(inputDir, '_assets', 'images', '*'),
                  dest: path.join(outputDir, '_assets', 'images')
                },
                {
                  src: path.join(inputDir, '_assets', 'fonts', '*'),
                  dest: path.join(outputDir, '_assets', 'fonts')
                }
              ]
            })
          ]
        },
        sourcemap: true
      },
      /**
       * Set to false to prevent Vite from clearing the terminal screen
       * and have Vite logging messages rendered alongside Eleventy output.
       */
      clearScreen: false,
      /**
       * @see https://vitejs.dev/config/#server-host
       */
      server: {
        hmr: {
          overlay: false
        },
        middlewareMode: true,
        mode: 'development'
      }
    }
  })

  // Add the elastic search plugin
  eleventyConfig.addPlugin(elasticSearch, {
    collection: "html", // Use items that are part of the "html" 11ty collection.
    // Supply a function that receives the item from the collection and returns a single ES document.
    document: ({ data, template, templateContent, issueData }) => {
      // Manipulate the item data into the desired formats.
      const {
        title,
        subtitle,
        short_abstract,
        abstract,
        publication,
        page,
        image: mainImage,
        BAStype,
        pub_date,
        pub_type,
        review_status,
        season,
        layout,
        palette,
        presentation,
        wordCount,
        order,
        series_issue_number,
        identifier: identifiers,
        acknowledgements,
        subjects,
        figures,
      } = data;
      const {
        title: issueTitle,
        subtitle: issueSubtitle,
        series_issue_number: issueSeriesIssueNumber,
        order: issueOrder,
        season: issueSeason,
        layout: issueLayout,
        class: issueClass,
        palette: issuePalette,
        acknowledgements: issueAcknowledgements,
        presentation: issuePresentation,
        caption: issueCaption,
        credit: issueCredit,
      } = issueData?.data || [];
      const { description, copyright, license, resource_link: resourceLink } = publication
      
      const articlePath = page?.fileSlug;

      // Filtering of some data requires template content in markdown format
      const split = template.frontMatter.content.split("\n")
      const splitContent = split.filter(String); // remove all empty strings

      // Filtering of Contributors
      const filteredContributors = publication?.contributor?.filter(con => {
        if (con?.pages?.some(contributorPage => (contributorPage.url === page.url))) {
          delete con.pages
          return con
        }
      }) || []; // This will default filteredContributors to an empty array
      // Trim filtered contributors to only id and full name
      var trimmedContributors = []
      filteredContributors.forEach(con => {
        var trimmedCons = { id: con.id, full_name: con.full_name }
        trimmedContributors.push(trimmedCons)
      })

      // Filtering of Footnotes
      const footnoteIndex = splitContent.indexOf("## Footnotes")
      const footnoteData = splitContent.slice(footnoteIndex)
      var filteredFootnotes = []
      const footnotesFiltering = data?.footnotes?.list.filter(fn => {
        const label = (`[^${fn.label}]`)
        const footnoteFilter = footnoteData.filter(str => str.includes(label))
        const footnote = (footnoteFilter.toString().split(`${label}: `))[1]
        var footnoteObject = { footnote_id: label, footnote: footnote }
        filteredFootnotes.push(footnoteObject)
      }) 


      // Two entries with id "/issue-01/" and one with "/" - convert into unique _ids
      // Also issues with page - do comparison of key with page.url
      var issueId = page.url
      var regexpExact = /(\/issue-)([\d]+)(\/)$/  // match exactly /issue-XX/ for any issue number
      var regexpGeneral = /(\/issue-)([\d]+)(\/)/  // match the /issue-XX/ for any issue number (not strict)
      var issueObjId = /(\/issue-)([\d]+)(\/issue-)([\d]+)$/  // match the issue-XX/issue-XX entry data
      if (regexpExact.test(issueId)) {
        issueId = page.url + data.key;
      } else if (page.url == "/") {
        issueId = title.toLowerCase();
      };

      // filter for figures in issues
      const filteredFigures = figures?.figure_list.filter(fig => {
        if (data.content.includes(fig?.id)) {
          return fig
        }
      })

      // Get paragraph tags and data
      var paragraphData = []
      var paragraphIndices = splitContent.map((e, i) => {
        if (e.includes("{% assign paragraph_DOI")) {
          return i
        } else {
          return ''
        }
      }) || []
      var paragraphIndices = paragraphIndices.filter(String) // remove all empty strings 
      if (paragraphIndices) {
        var match = paragraphIndices.forEach(pIndex => {
          var paragraphs = []
          const id = splitContent[pIndex]
          var paraEnded = false
          var plusIndex = 1
          // Get the paragraphs without the figures/contributors spaced between the paras
          while (paraEnded == false) {
            if (splitContent[pIndex + plusIndex]) {
              if (splitContent[pIndex + plusIndex].startsWith("{% assign") == true ||
                splitContent[pIndex + plusIndex].startsWith("{% backmatter")) {
                //if following is assign then there's no data so return
                paraEnded = true
              } else if (splitContent[pIndex + plusIndex].startsWith("{%") == true) {
                //if there is a tag after id
                plusIndex += 1
              } else {
                paragraphs.push(splitContent[pIndex + plusIndex])
                plusIndex += 1
              }
            } else {
              paraEnded = true
            }
          }
          var paraObj = { paragraph_id: id, paragraph: paragraphs }
          paragraphData.push(paraObj)
        })
      }


      // Get section tags and headings
      var sectionData = []
      var sectionIndices = splitContent.map((e, i) => {
        if (e.includes("{% assign chapter_DOI")) {
          return i
        } else {
          return ''
        }
      }) || []
      var sectionIndices = sectionIndices.filter(String) // remove all empty strings 
      if (sectionIndices) {
        var sectionData = []
        var sectionHeading = ""
        var match = sectionIndices.forEach(pIndex => {
          const id = splitContent[pIndex]
          var sectionEnded = false
          var plusIndex = 1
          // Get the sections without the figures/contributors spaced between the paras
          while (sectionEnded == false) {
            if (splitContent[pIndex + plusIndex]) {
              if (splitContent[pIndex + plusIndex].startsWith("{% assign") == true ||
                splitContent[pIndex + plusIndex].startsWith("{% backmatter")) {
                //if following is assign then there's no data so return
                sectionEnded = true
              } else if (splitContent[pIndex + plusIndex].startsWith("{%") == true) {
                //if there is a tag after id
                plusIndex += 1
              } else {
                sectionHeading = (splitContent[pIndex + plusIndex])
                sectionEnded = true
              }
            } else {
              sectionEnded = true
            }
          }
          var sectionObj = { section_id: id, section_heading: sectionHeading }
          sectionData.push(sectionObj)
        })
      }
      

      // Return the object representing a single entry in the index for ES.
      return {
        _id: issueId,
        issue: {
          series_issue_number: issueSeriesIssueNumber,
          order: issueOrder,
          title: issueTitle,
          subtitle: issueSubtitle,
          acknowledgements: issueAcknowledgements,
          season: issueSeason,
          layout: issueLayout,
          caption: issueCaption,
          credit: issueCredit,
          presentation: issuePresentation,
          class: issueClass,
          palette: issuePalette,
        },
        content: {
          frontmatter: {
            series_issue_number,
            order,
            palette,
            path: articlePath,
            title,
            subtitle,
            BAStype,
            pub_type,
            wordCount,
            subjects,
          },
          contributors: { contributor: filteredContributors },
          text: {
            short_abstract,
            abstract,
            acknowledgements,
            sections:sectionData,
            paragraphs:paragraphData,
          },
          illustrations: {},
          slides: {},
          footnotes: {footnotes: filteredFootnotes},
          bibliography: {}, // need "references" changing to "reference" in article yaml
          endsmatter: {
            pub_date,
            review_status,
            license,
            identifiers
          }
        },
        search: {
          pub_date,
          BAStype,
          title,
          subtitle,
          contributors: trimmedContributors,
          // figures
          subjects,
          palette
        },
        page: { // page.md doesn't appear to be anywhere
        },
        _source: { page }
      }
    }
  })

  /**
   * Set eleventy dev server options
   * @see https://www.11ty.dev/docs/dev-server/
   */
  eleventyConfig.setServerOptions({
    port: 8080
  })

  // @see https://www.11ty.dev/docs/copy/#passthrough-during-serve
  // @todo resolve error when set to the default behavior 'passthrough'
  eleventyConfig.setServerPassthroughCopyBehavior('copy')

  /**
   * Copy static assets to the output directory
   * @see https://www.11ty.dev/docs/copy/
   */
  if (process.env.ELEVENTY_ENV === 'production') eleventyConfig.addPassthroughCopy(publicDir)
  eleventyConfig.addPassthroughCopy(`${inputDir}/_assets`)
  eleventyConfig.addPassthroughCopy({ '_includes/web-components': '_assets/javascript' })

  /**
   * Watch the following additional files for changes and rerun server
   * @see https://www.11ty.dev/docs/config/#add-your-own-watch-targets
   * @see https://www.11ty.dev/docs/watch-serve/#ignore-watching-files
   */
  eleventyConfig.addWatchTarget('./**/*.css')
  eleventyConfig.addWatchTarget('./**/*.js')
  eleventyConfig.addWatchTarget('./**/*.scss')

  /**
   * Ignore changes to programmatic build artifacts
   * @see https://www.11ty.dev/docs/watch-serve/#ignore-watching-files
   * @todo refactor to move these statements to the tranform plugins
   */
  eleventyConfig.watchIgnores.add('_epub')
  eleventyConfig.watchIgnores.add('_pdf')
  eleventyConfig.watchIgnores.add('_temp')

  return {
    /**
     * @see {@link https://www.11ty.dev/docs/config/#configuration-options}
     */
    dir: {
      // ⚠️ input and output dirs are _relative_ to the `.eleventy.js` module
      input: process.env.ELEVENTY_INPUT || inputDir,
      output: process.env.ELEVENTY_OUTPUT || outputDir,
      // ⚠️ the following directories are _relative_ to the `input` directory
      data: process.env.ELEVENTY_DATA || '_computed',
      includes: process.env.ELEVENTY_INCLUDES || path.join('..', '_includes'),
      layouts: process.env.ELEVENTY_LAYOUTS || path.join('..', '_layouts'),
    },
    /**
     * The default global template engine to pre-process HTML files.
     * Use false to avoid pre-processing and passthrough copy the content (HTML is not transformed, so technically this could be any plaintext).
     * @see {@link https://www.11ty.dev/docs/config/#default-template-engine-for-html-files}
     */
    htmlTemplateEngine: 'liquid',
    /**
     * Suffix for template and directory specific data files
     * @example '.data' will search for `*.data.js` and `*.data.json` data files.
     * @see {@link https://www.11ty.dev/docs/data-template-dir/ Template and Directory Specific Data Files}
     */
    jsDataFileSuffix: '.data',
    /**
     * The default global template engine to pre-process markdown files.
     * Use false to avoid pre-processing and only transform markdown.
     * @see {@link https://www.11ty.dev/docs/config/#default-template-engine-for-markdown-files}
     */
    markdownTemplateEngine: 'liquid',
    /**
     * @see {@link https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix}
     */
    pathPrefix: '/',
    /**
     * All of the following template formats support universal shortcodes.
     *
     * Nota bene:
     * Markdown files are pre-processed as Liquid templates by default. This
     * means that shortcodes available in Liquid templates are also available
     * in Markdown files. Likewise, if you change the template engine for
     * Markdown files, the shortcodes available for that templating language
     * will also be available in Markdown files.
     * @see {@link https://www.11ty.dev/docs/config/#template-formats}
     */
    templateFormats: [
      '11ty.js', // JavaScript
      'hbs',     // Handlebars
      'liquid',  // Liquid
      'md',      // Markdown
      'njk',     // Nunjucks
    ]
  }
}
