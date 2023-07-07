const fs = require('fs');

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
                        title: { "type": "text" },
                        subtitle: { "type": "text" },
                        contributors: { "type": "object" },
                        // contributors: {
                        //     properties: {
                        //         id: { "type": "text" },
                        //         type: { "type": "keyword" },
                        //         first_name: { "type": "text" },
                        //         last_name: { "type": "text" },
                        //         full_name: { "type": "text" },
                        //         title: { "type": "text" },
                        //         affiliation: { "type": "text" },
                        //         bio: { "type": "text" },
                        //         pic: { "type": "text" },
                        //         sort_as: { "type": "text" }
                        //     }
                        // },
                        description: { "type": "text" },
                        abstract: { "type": "text" },
                        contentType: { "type": "keyword" },
                        identifiers: {
                            properties: {
                                doi: { "type": "text" },
                                issn: { "type": "keyword" }
                            }
                        },
                        copyright: { "type": "text" },
                        licence: {
                            properties: {
                                name: { "type": "text" },
                                abbreviation: { "type": "text" },
                                url: { "type": "text" },
                                scope: { "type": "text" }
                            }
                        },
                        issueSource: {
                            properties: {
                                page: {
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

                            },
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
            // type: "document",
            id: doc._id,
            body: {
                title: doc?.title,
                subtitle: doc?.subtitle,
                contributors: doc?.contributors,
                // contributors: {
                //     id: doc?.contributors.map(contribData => {return contribData.id}),
                //     type: doc?.contributors.map(contribData => {return contribData.type}),
                //     first_name: doc?.contributors.map(contribData => {return contribData.first_name}),
                //     last_name: doc?.contributors.map(contribData => {return contribData.last_name}),
                //     full_name: doc?.contributors.map(contribData => {return contribData.full_name}),
                //     title: doc?.contributors.map(contribData => {return contribData.title}),
                //     affiliation: doc?.contributors.map(contribData => {return contribData.affiliation}),
                //     bio: doc?.contributors.map(contribData => {return contribData.bio}),
                //     pic: doc?.contributors.map(contribData => {return contribData.pic}),
                //     sort_as: doc?.contributors.map(contribData => {return contribData.sort_as})
                // },
                description: doc?.description,
                abstract: doc?.abstract,
                contentType: doc?.contentType,
                identifiers: {
                    doi: doc?.identifiers?.doi,
                    issn: doc?.identifiers?.issn
                },
                copyright: doc?.copyright,
                license: {
                    name: doc?.license?.name,
                    abbreviation: doc?.license?.abbreviation,
                    url: doc?.license?.url,
                    scope: doc?.license?.scope
                },
                issueSource: doc?._source
            }
        }, function (err, resp) {
            if (err) {
                console.log(err)
            }
        })
    ))
}

// console.log(indexName)
// client.index({
//     index: indexName,
//     type: "document",
//     id: _id,
//     body: {
//         title: data.title,
//         subtitle: data.subtitle,
//         contributor: data.contributor,
//         pub_date : data.pub_date,
//         pub_type: data.pub_type,
//         doi: data.doi,
//         issn: data.issn,
//         language: data.language,
//         layout: data.layout,
//         order: data.order,
//         references: refArray,
//         series_issue_number: data.series_issue_number,
//         series_periodical_name: data.series_periodical_name,
//         abstract: data.abstract,
//         acknowledgements: data.acknowledgements,
//     }
//     }, function (err, resp){
//         if (err) {
//             console.log(err)
//         } 
//     })
// }




module.exports = {
    setupES: deleteIndexFn,
    indexing: addDocument,
}
