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
                        type: { "type": "keyword" },
                        series_issue_number: { "type": "short" },
                        order: { "type": "short" },
                        title: { "type": "text" },
                        subtitle: { "type": "text" },
                        acknowledgements: { "type": "text" },
                        layout: { "type": "keyword" },
                        cover: {
                            "type": "nested",
                            properties: {
                                id: { "type": "keyword" },
                                caption: { "type": "text" },
                                credit: { "type": "text" },
                            }
                        },
                        presentation: { "type": "keyword" },
                        class: { "type": "keyword" },
                        palette: { "type": "text" },
                        identifier: {
                            properties: {
                                id: { "type": "keyword" }
                            }
                        },
                        pageContent: { "type": "text" },
                        issue: {
                            properties: {
                                series_issue_number: { "type": "short" },
                                order: { "type": "short" },
                                title: { "type": "text" },
                                subtitle: { "type": "text" },
                                acknowledgements: { "type": "text" },
                                season: { "type": "text" },
                                layout: { "type": "keyword" },
                                cover: {
                                    "type": "nested",
                                    properties: {
                                        id: { "type": "keyword" },
                                        caption: { "type": "text" },
                                        credit: { "type": "text" },
                                    }
                                },
                                presentation: { "type": "keyword" },
                                class: { "type": "keyword" },
                                palette: { "type": "text" },
                                identifier: {
                                    properties: {
                                        id: { "type": "keyword" }
                                    }
                                }
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
                                        banner: { "type": "keyword" },
                                        bannerCaption: { "type": "text" },
                                        bannerCredit: { "type": "text" },
                                        tile: { "type": "keyword" },
                                        tileCaption: { "type": "text" },
                                        tileCredit: { "type": "text" },
                                        subjects: {
                                            properties: {
                                                type: { "type": "keyword" },
                                                name: { "type": "text" },
                                            }
                                        },
                                    }
                                },
                                contributors: {
                                    "type": "nested",
                                    properties: {
                                        id: { "type": "keyword" },
                                        first_name: { "type": "text" },
                                        last_name: { "type": "text" },
                                        full_name: { "type": "text" },
                                        title: { "type": "text" },
                                        affiliation: { "type": "text" },
                                        bio: { "type": "text" },
                                        pic: { "type": "keyword" },
                                        url: { "type": "keyword" },
                                    }
                                },
                                text: {
                                    "type": "nested",
                                    properties: {
                                        short_abstract: { "type": "text" },
                                        abstract: { "type": "text" },
                                        acknowledgements: { "type": "text" },
                                        sections: {
                                            "type": "nested",
                                            properties: {
                                                section_id: { "type": "text" },
                                                section: { "type": "text" },
                                            }
                                        },
                                        paragraphs: {
                                            "type": "nested",
                                            properties: {
                                                paragraph_id: { "type": "text" },
                                                paragraph: { "type": "text" },
                                            }
                                        },
                                    }
                                },
                                illustrations: {
                                    "type": "nested",
                                    properties: {
                                        layout: { "type": "text" },
                                        id: { "type": "keyword" },
                                        src: { "type": "keyword" },
                                        label: { "type": "text" },
                                        media_type: { "type": "keyword" },
                                        media_id: { "type": "text" },
                                        caption: { "type": "text" },
                                        credit: { "type": "text" },
                                        alt: { "type": "text" },
                                    }
                                },
                                slides: {
                                    properties: {
                                        id: { "type": "keyword" },
                                        order: { "type": "short" },
                                        object_list: {
                                            "type": "nested",
                                            properties: {
                                                id: { "type": "keyword" },
                                                figure: {
                                                    properties: {
                                                        id: { "type": "keyword" }
                                                    },
                                                },
                                                figures: {
                                                    "type": "nested",
                                                    properties: {
                                                        id: { "type": "keyword" },
                                                        label: { "type": "text" },
                                                        src: { "type": "keyword" },
                                                        caption: { "type": "text" },
                                                        credit: { "type": "text" },
                                                        media_type: { "type": "text" },
                                                        media_id: { "type": "keyword" },
                                                    }
                                                },
                                            }
                                        },
                                        paragraphs: {
                                            properties: {
                                                paragraph_id: { "type": "text" },
                                                paragraph: { "type": "text" },
                                            }
                                        },
                                        sections: {
                                            properties: {
                                                section_id: { "type": "text" },
                                                section: { "type": "text" },
                                            }
                                        }
                                    }
                                },
                                footnotes: {
                                    "type": "nested",
                                    properties: {
                                        footnote_id: { "type": "text" },
                                        footnote: { "type": "text" },
                                    }
                                },
                                bibliography: {
                                    "type": "nested",
                                    properties: {
                                        full: { "type": "text" },
                                        id: { "type": "keyword" }
                                    }
                                },
                                endsmatter: {
                                    properties: {
                                        pub_date: { "type": "date" },
                                        review_status: { "type": "text" },
                                        licence: {
                                            "type": "nested",
                                            properties: {
                                                text: { "type": "text" },
                                                href: { "type": "keyword" },
                                                isExternalLink: { "type": "boolean" },
                                            }
                                        },
                                        identifier: {
                                            properties: {
                                                doi: { "type": "keyword" },
                                                issn: { "type": "keyword" },
                                            }
                                        },
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
                                contributors: {
                                    "type": "nested",
                                    properties: {
                                        id: { "type": "keyword" },
                                        full_name: { "type": "keyword" },
                                    }
                                },
                                tile: { "type": "keyword" },
                                tileCaption: { "type": "text" },
                                tileCredit: { "type": "text" },
                                subjects: {
                                    properties: {
                                        type: { "type": "keyword" },
                                        name: { "type": "text" }
                                    }
                                },
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
    esDocs.forEach(doc => {
        if (doc?.type == "page") {
            client.index({
                index: indexName,
                id: doc._id,
                body: {
                    type: doc?.type,
                    order: doc?.order,
                    title: doc?.title,
                    layout: doc?.layout,
                    pageContent: doc?.content,
                }
            })
        } else if (doc?.type == "issue") {
            client.index({
                index: indexName,
                id: doc._id,
                body: {
                    type: doc?.type,
                    series_issue_number: doc?.series_issue_number,
                    order: doc?.order,
                    title: doc?.title,
                    subtitle: doc?.subtitle,
                    acknowledgements: doc?.acknowledgements,
                    layout: doc?.layout,
                    cover: doc?.cover,
                    presentation: doc?.presentation,
                    pageContent: doc?.content,
                    class: doc?.class,
                    palette: doc?.palette,
                    identifier: doc?.identifier
                }
            })
        } else {
            client.index({
                index: indexName,
                id: doc._id,
                body: {
                    type: doc?.type,
                    issue: {
                        series_issue_number: doc?.issue?.series_issue_number,
                        order: doc?.issue?.order,
                        title: doc?.issue?.title,
                        subtitle: doc?.issue?.subtitle,
                        acknowledgements: doc?.issue?.acknowledgements,
                        season: doc?.issue?.season,
                        layout: doc?.issue?.layout,
                        cover: doc?.issue?.cover,
                        presentation: doc?.issue?.presentation,
                        class: doc?.issue?.class,
                        //palette: doc?.issue?.palette,
                        identifier: doc?.issue?.identifier
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
                            banner: doc?.content?.frontmatter?.banner,
                            bannerCaption: doc?.content?.frontmatter?.bannerCaption,
                            bannerCredit: doc?.content?.frontmatter?.bannerCredit,
                            tile: doc?.content?.frontmatter?.tile,
                            tileCaption: doc?.content?.frontmatter?.tileCaption,
                            tileCredit: doc?.content?.frontmatter?.tileCredit,
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
                            identifier: doc?.content?.endsmatter?.identifier,
                        }
                    },
                    search: {
                        pub_date: doc?.search?.pub_date,
                        BAStype: doc?.search?.BAStype,
                        title: doc?.search?.title,
                        subtitle: doc?.search?.subtitle,
                        contributors: doc?.search?.contributors,
                        tile: doc?.content?.frontmatter?.tile,
                        tileCaption: doc?.content?.frontmatter?.tileCaption,
                        tileCredit: doc?.content?.frontmatter?.tileCredit,
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
        }
    })
}



module.exports = {
    setupES: deleteIndexFn,
    indexing: addDocument,
}
