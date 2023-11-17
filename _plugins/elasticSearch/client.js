// Script to create the bas-quire ES index and manage the alias 


function initialiseIndex(esDocs, baseIndexName, client) {
    // first check index exists by checking if alias exists
    client.indices.existsAlias({ name: baseIndexName })
        .then(async function (exists) {
            if (exists) {
                console.log(`Alias (${baseIndexName}) exists.`)
                // if index exists then create a new one with updated timestamp
                const newIndexName = await createIndexFn(baseIndexName, client);
                // remove aliases from all indices (after so only once the new index has been created successfully)
                await removeAliases(baseIndexName, client);
                // attach alias to new index
                await attachAlias(newIndexName, baseIndexName, client);
                // index documents from es-index.json 
                await addDocument(esDocs, newIndexName, client);
            } else {
                console.log(`Alias (${baseIndexName}) doesn't exist.`)
                // if index doesn't exist create new index with timestamp
                const newIndexName = await createIndexFn(baseIndexName, client);
                // attach the base index name as an alias to the new index 
                await attachAlias(newIndexName, baseIndexName, client);
                // index documents from es-index.json 
                await addDocument(esDocs, newIndexName, client);
            }
        }).catch(async function (err) {
            console.log(err);
            return;
        });
}

function removeAliases(aliasName, client) {
    console.log(`Removing alias ${aliasName} from all indices.`)
    return client.indices.deleteAlias({ index: "*", name: aliasName })
}

function attachAlias(indexName, aliasName, client) {
    console.log(`Attaching alias "${aliasName}" to new index "${indexName}".\n`)
    return client.indices.putAlias({ index: indexName, name: aliasName })
}

async function createIndexFn(baseIndexName, client) {
    const currentDate = new Date()
    const dateString = currentDate.toISOString()
    var newIndexName = `${baseIndexName}-${dateString}`
    newIndexName = newIndexName.replaceAll(":", ".")
    newIndexName = newIndexName.toLowerCase()

    console.log(`Creating new index: ${newIndexName}...`);
    await client.indices.create({
        index: newIndexName,
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
                    palette: {
                        properties: {
                            mainTheme: { "type": "keyword" },
                            light: { "type": "keyword" },
                            dark: { "type": "keyword" }
                        }
                    },
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
                            palette: {
                                properties: {
                                    mainTheme: { "type": "keyword" },
                                    light: { "type": "keyword" },
                                    dark: { "type": "keyword" }
                                }
                            },
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
                                    palette: {
                                        properties: {
                                            mainTheme: { "type": "keyword" },
                                            light: { "type": "keyword" },
                                            dark: { "type": "keyword" }
                                        }
                                    },
                                    path: { "type": "keyword" },
                                    issuePalette: {
                                        properties: {
                                            mainTheme: { "type": "keyword" },
                                            light: { "type": "keyword" },
                                            dark: { "type": "keyword" }
                                        }
                                    },
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
                                        "type": "nested",
                                        properties: {
                                            type: { "type": "keyword" },
                                            name: { "type": "keyword" },
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
                                    path: { "type": "keyword" },
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
                                "type": "nested",
                                properties: {
                                    type: { "type": "keyword" },
                                    name: { "type": "keyword" }
                                }
                            },
                            palette: {
                                properties: {
                                    mainTheme: { "type": "keyword" },
                                    light: { "type": "keyword" },
                                    dark: { "type": "keyword" }
                                }
                            },
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
    });

    return newIndexName;
}

async function addDocument(esDocs, indexName, client) {
    console.log("Indexing documents from es-index.json...")

    // Get arrays of each doc type
    const pageDocs = esDocs.filter((doc) => {
        if (doc?.type == "page") { return doc }
    }) || []

    if (pageDocs) {
        var operations = pageDocs.flatMap(doc => [
            { index: { _index: indexName, _id: doc?._id } },
            {
                type: doc?.type,
                order: doc?.order,
                title: doc?.title,
                layout: doc?.layout,
                pageContent: doc?.content,
            }])
        var bulkResponse = await client.bulk({ refresh: true, operations })
        console.log("    - Indexed documents with 'page' type.")
    }


    const issueDocs = esDocs.filter((doc) => {
        if (doc?.type == "issue") { return doc }
    }) || []

    if (issueDocs) {
        var operations = issueDocs.flatMap(doc => [
            { index: { _index: indexName, _id: doc?._id } },
            {
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
        ])
        var bulkResponse = await client.bulk({ refresh: true, operations })
        console.log("    - Indexed documents with 'issue' type.")
    }

    const articleDocs = esDocs.filter((doc) => {
        if (doc?.type == 'slide' || doc?.type == 'article') { return doc }
    }) || []

    if (articleDocs) {
        var operations = articleDocs.flatMap(doc => [
            { index: { _index: indexName, _id: doc?._id } },
            {
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
                    palette: doc?.issue?.palette,
                    identifier: doc?.issue?.identifier
                },
                content: {
                    frontmatter: {
                        series_issue_number: doc?.content?.frontmatter?.series_issue_number,
                        order: doc?.content?.frontmatter?.order,
                        palette: doc?.content?.frontmatter?.palette,
                        path: doc?.content?.frontmatter?.path,
                        issuePalette: doc?.content?.frontmatter?.issuePalette,
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
                    palette: doc?.search?.palette
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
        ])
        var bulkResponse = await client.bulk({ refresh: true, operations })
        console.log("    - Indexed documents with `article` and `slide` type.")
    }
}


module.exports = {
    setupES: initialiseIndex,
}
