const fs = require('fs');
const path = require('path');
const { title } = require('process');

function deleteIndexFn(indexName, client) {
    client.indices.exists({ index: indexName }, function (err, resp) {
        if (err) {
            console.log(err);
            return;
        }
        if (resp) { // if index exists - delete
            console.log(indexName + ' exists and will be deleted');
            client.indices.delete({
                index: indexName
            })
        }
        createIndexFn(indexName, client);
    });
}


function createIndexFn(indexName, client) {
    client.indices.exists({ index: indexName }, function (err, resp) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(indexName + ' creation...');
        client.indices.create({
            index: indexName,
            body: {
                mappings: {
                    properties: {
                        issue: {
                            properties: {
                                series_issue_number: { "type": "short" },
                                order: { "type": "short" },
                                title: { "type": "text" },
                                subtitle: { "type": "text" },
                                acknowledgements: { "type": "text" },
                                season: { "type": "text" },
                                layout: { "type": "keyword" },
                                caption: { "type": "text" },
                                credit: { "type": "text" },
                                presentation: { "type": "keyword" },
                                class: { "type": "keyword" },
                                palette: { "type": "text" },
                            }
                        },
                        content: {
                            properties: {
                                frontmatter: {
                                    properties: {
                                        series_issue_number: { "type": "short" },
                                        order: { "type": "short" },
                                        palette: { "type": "text" },
                                        path: { "type": "keyword" },
                                        issuePalette: { "type": "text" },
                                        title: { "type": "text" },
                                        subtitle: { "type": "text" },
                                        BAStype: { "type": "keyword" },
                                        pub_type: { "type": "keyword" },
                                        wordCount: { "type": "text" },
                                        subjects: { "type": "object" },
                                    }
                                },
                                contributors: { "type": "object" },
                                text: {
                                    properties: {
                                        short_abstract: { "type": "text" },
                                        abstract: { "type": "text" },
                                        acknowledgements: { "type": "text" },
                                        sections: { "type": "object" },
                                        paragraphs: { "type": "object" },
                                    }
                                },
                                illustrations: { "type": "object" },
                                slides: { "type": "object" },
                                footnotes: { "type": "object" },
                                bibliography: { "type": "object" },
                                endsmatter: {
                                    properties: {
                                        pub_date: { "type": "date" },
                                        review_status: { "type": "text" },
                                        licence: { "type": "object" },
                                        identifiers: { "type": "object" },
                                    }
                                },
                            }
                        },
                        search: {
                            properties: {
                                pub_date: { "type": "date" },
                                BAStype: { "type": "keyword" },
                                title: { "type": "text" },
                                subtitle: { "type": "text" },
                                contributors: { "type": "object" },
                                subjects: { "type": "object" },
                                palette: { "type": "text" },
                            }
                        },
                        source: {
                            properties: {
                                date: { "type": "date" },
                                inputPath: { "type": "text" },
                                fileSlug: { "type": "text" },
                                filePathStem: { "type": "text" },
                                outputFileExtension: { "type": "text" },
                                templateSyntax: { "type": "text" },
                                url: { "type": "text" },
                                outputPath: { "type": "text" },
                                lang: { "type": "text" },
                            }
                        }
                    }
                }
            }
        })
    })
}

function addDocument(esDocs, indexName, client) {
    esDocs.forEach(doc => (
        client.index({
            index: indexName,
            id: doc._id,
            body: {
                issue: {
                    series_issue_number: doc?.issue?.series_issue_number,
                    order: doc?.issue?.order,
                    title: doc?.issue?.title,
                    subtitle: doc?.issue?.subtitle,
                    acknowledgements: doc?.issue?.acknowledgements,
                    season: doc?.issue?.season,
                    layout: doc?.issue?.layout,
                    caption: doc?.issue?.caption,
                    credit: doc?.issue?.credit,
                    presentation: doc?.issue?.presentation,
                    class: doc?.issue?.class,
                    //palette: doc?.issue?.palette,
                },
                content: {
                    frontmatter: {
                        series_issue_number: doc?.content?.frontmatter?.series_issue_number,
                        order: doc?.content?.frontmatter?.order,
                       // palette: doc?.content?.frontmatter?.palette,
                        path: doc?.content?.frontmatter?.path,
                       // issuePalette: doc?.content?.frontmatter?.issuePalette,
                        title: doc?.content?.frontmatter?.title,
                        subtitle: doc?.content?.frontmatter?.subtitle,
                        BAStype: doc?.content?.frontmatter?.BAStype,
                        pub_type: doc?.content?.frontmatter?.pub_type,
                        wordCount: doc?.content?.frontmatter?.wordCount,
                        subjects: doc?.content?.frontmatter?.subjects
                    },
                    contributors: doc?.content?.contributors,
                    text: {
                        short_abstract: doc?.content?.text?.short_abstract,
                        abstract: doc?.content?.text?.abstract,
                        acknowledgements: doc?.content?.text?.acknowledgements,
                        sections: doc?.content?.text?.sections,
                        paragraphs: doc?.content?.text?.paragraphs,
                    },
                    illustrations: doc?.content?.illustrations,
                    slides: doc?.content?.slides,
                    footnotes: doc?.content?.footnotes,
                    bibliography: doc?.content?.bibliography,
                    endsmatter: {
                        pub_date: doc?.content?.endsmatter?.pub_date,
                        review_status: doc?.content?.endsmatter?.review_status,
                        licence: doc?.content?.endsmatter?.licence,
                        identifiers: doc?.content?.endsmatter?.identifiers,
                    }
                },
                search: {
                    pub_date: doc?.search?.pub_date,
                    BAStype: doc?.search?.BAStype,
                    title: doc?.search?.title,
                    subtitle: doc?.search?.subtitle,
                    contributors: doc?.search?.contributors,
                    subjects: doc?.search?.subjects,
                   // palette: doc?.search?.palette
                },
                source: {
                    date: doc?._source?.date,
                    inputPath: doc?._source?.inputPath,
                    fileSlug: doc?._source?.fileSlug,
                    filePathStem: doc?._source?.filePathStem,
                    outputFileExtension: doc?._source?.outputFileExtension,
                    templateSyntax: doc?._source?.templateSyntax,
                    url: doc?._source?.url,
                    outputPath: doc?._source?.outputPath,
                    lang: doc?._source?.lang
                }
            }
        }, function (err, resp) {
            if (err) {
                console.log(err)
            }
        })
    ))
}



module.exports = {
    setupES: deleteIndexFn,
    indexing: addDocument,
}
