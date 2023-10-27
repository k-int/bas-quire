const { getItemIdentifier, normalizePalette, parseSections, mapToKeys, mediaUrl } = require('./_shared')
const type = 'article'
const articleRegex = /^(issue-)([\d]+)/i

const getIllustrations = ( figureList, content, frontMatterContent ) => 
	figureList
		.filter(({ id }) => id && content.includes(id))
		.map((x) => {

			const matchFigGroup = x.id &&
				frontMatterContent.some(element =>
					element.includes("figuregroup") && (element.includes(x.id)))
				
			if (mediaUrl == undefined) {
				var path = undefined
			} else {
				var path = mediaUrl + "/content/_assets/images/" + x.src
				if (x?.src?.includes("table")) {
					var path = mediaUrl + "/content/_assets/" + x.src
				}
			}

			return {
				layout: (matchFigGroup ? matchFigGroup : x.figuregroup),
				id: x.id,
				src: x.src,
				path: path,
				label: x.label,
				media_type: x.media_type,
				media_id: x.media_id,
				caption: x.caption,
				credit: x.credit,
				alt: x.alt,
			};
		}) || [];
		
const getSlideData = ( slideData, objectList ) => slideData?.map(slide => {
	const objData = objectList.filter(obj => {
		if (obj?.id == slide?.data?.object?.[0]?.id) {
			// some have mediaId and mediaType rather than 
			// media_id and media_type

			if (mediaUrl == undefined) {
				var path = undefined
			} else {
				var path = mediaUrl + "/content/_assets/images/" + obj.src
				if (obj?.src?.includes("table")) {
					var path = mediaUrl + "/content/_assets/" + obj.src
				}
			}

			const modifiedFigures = obj.figures
				.map(innerfig => ({
					id: innerfig.id,
					src: innerfig.src,
					path: path,
					label: innerfig.label,
					media_type: innerfig.media_type,
					media_id: innerfig.media_id,
					caption: innerfig.caption,
					credit: innerfig.credit,
					alt: innerfig.alt,
				}))
				
//			delete obj.figures
			obj["figures"] = modifiedFigures
			return obj
		}
	})

	// Split content and use to get paragraphs and section data
	const splitSlideContent = slide?.template.frontMatter.content.split("\n").filter(String); // remove all empty strings
	const paragraphData = parseSections(splitSlideContent, "{% assign paragraph_DOI", "paragraph_id", "paragraph")
	const sectionData = parseSections(splitSlideContent, "{% assign chapter_DOI", "section_id", "section_heading")
	const splitId = slide?.data?.key.replaceAll("/", "_")

	return {
		id: splitId,
		order: slide?.data?.order,
		presentation: slide?.data?.presentation,
		object_list: objData,
		sections: sectionData,
		paragraphs: paragraphData
	}
})

const getFootnotes = (content, footnotesList) => 
	footnotesList?.map(({ label }) => {
	
		const footnoteIndex = content.indexOf("## Footnotes")
		const footnoteData = content.slice(footnoteIndex)

		const wrappedLabel = `[^${label}]`
		const footnoteFilter = footnoteData.filter(str => str.includes(wrappedLabel))
		const footnote = (footnoteFilter.toString().split(`${wrappedLabel}: `))[1]

		return {
			footnote_id: wrappedLabel,
			footnote
		}
	}) || []
	
const getReferences = (references, referenceList) => 
	references?.filter(({ id }) => referenceList?.includes(id)) || [] 

module.exports = (eleventyConfig) => {
	
	const issueConfig = require('./issue')(eleventyConfig)
	const getContributor = eleventyConfig.getFilter('getContributor')
	
	return {
		type,
		predicate: ( item ) => getItemIdentifier( item ).match(articleRegex),
		
		buildIndexEntry( item ) {
			
			// Grab the issue template but strip out the bits we don't need...
			const { _id, type: _issueType, ...issueObject } = issueConfig.buildIndexEntry(item)
			
			const {
				slideData,
				template: { frontMatter: { content: frontMatterContent }, _frontMatter: {data: frontMatterData} },
				page,
				data: {
					series_issue_number,
					order,
					title,
					subtitle,
					short_abstract,
					abstract,
					// publication,
					banner,
					["banner-caption"]: bannerCaption,
					["banner-credit"]: bannerCredit,
					tile,
					["tile-caption"]: tileCaption,
					["tile-credit"]: tileCredit,
					BAStype,
					pub_date,
					pub_type,
					review_status,
					palette,
					licence,
					wordCount,
					identifier,
					acknowledgements,
					subjects,
					figures,
					objects,
					references,
					contributor,
					content,
					footnotes
			}} = item;
			
			const { fileSlug: path } = page
			
			const fmContentArray = frontMatterContent.split("\n").filter(String); // remove all empty strings
			
			const contributors = contributor?.map(getContributor) || []
			
			const normalizedPalette = normalizePalette( palette )
			
			const itemId = getItemIdentifier(item)
			
			return {
				_id: itemId,
				type: itemId.includes("slide") ? "slide" : type,
				issue: issueObject,
				content: {
					frontmatter: {
						series_issue_number,
						order,
						palette: normalizedPalette,
						path,
						issuePalette: issueObject.palette,
						title,
						subtitle,
						BAStype,
						pub_type,
						wordCount,
						banner,
						bannerCaption,
						bannerCredit,
						tile,
						tileCaption,
						tileCredit,
						subjects
					},
					contributors: contributors.map(
						mapToKeys(['id', 'first_name', 'last_name', 'full_name', 'title', 'affiliation', 'bio', 'pic', 'url'])),
					text: {
						short_abstract,
						abstract,
						acknowledgements,
						sections: parseSections(fmContentArray, "{% assign chapter_DOI", "section_id", "section_heading"),
						paragraphs: parseSections(fmContentArray, "{% assign paragraph_DOI", "paragraph_id", "paragraph"),
					},
					illustrations: getIllustrations( figures.figure_list, content, fmContentArray ),
					slides: getSlideData(slideData, objects?.object_list),
					footnotes: getFootnotes(fmContentArray, footnotes?.list),
					bibliography: getReferences(references.entries, frontMatterData.references),
					endsmatter: {
						pub_date,
						review_status,
						licence,
						identifier
					}
				},
				search: {
					pub_date,
					BAStype,
					title,
					subtitle,
					contributors: contributors.map(mapToKeys(['id', 'full_name'])),
					tile,
					tileCaption,
					tileCredit,
					subjects,
					palette: normalizedPalette,
				},
				_source: page
			}
		}
	}
}