const { getItemIdentifier, normalizePalette } = require('./_shared')
const type = 'issue'
const issueRegex = /^(issue-)([\d]+)$/i


module.exports = (_eleventyConfig) => {
	
	return {
		type,
		predicate: ( item ) => getItemIdentifier( item ).match(issueRegex),
		
		buildIndexEntry( item ) {
			
			const {
				data: { figures },
				issueData: { data: {
					title,
					subtitle,
					series_issue_number,
					order,
					season,
					layout,
					cover,
					class: clazz, // reserved word...
					palette,
					acknowledgements,
					presentation,
					identifier
				} } } = item;
			
			// Filtering of covers for Issue 
			const issueCovers = figures?.figure_list
				.filter(fig => fig?.id == cover)
				.map(cov => {
					return {
						id: cov?.id,
						coverCaption: cov?.caption,
						coverCredit: cov?.credit,
					}
				}) || []
			
			return {
				_id: getItemIdentifier( item ),
				identifier,
				type,
				series_issue_number,
				order,
				title,
				subtitle,
				acknowledgements,
				season,
				layout,
				presentation,
				class: clazz,
				cover: issueCovers,
				palette: normalizePalette( palette )
			}
		}
	}
}