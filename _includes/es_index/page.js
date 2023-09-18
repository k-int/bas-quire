const { getItemIdentifier } = require('./_shared')
const type = 'page'

module.exports = (_eleventyConfig) => {
	
	return {
		type,
		predicate: ( item ) => {
			// return true if we can return this type of document.
			const hasItem = typeof item != 'undefined'
			const hasPage = typeof item?.page != 'undefined'
			const hasData = typeof item?.data != 'undefined'
			const hasContent = typeof item?.template?.frontMatter?.content != 'undefined'
			
			return hasItem && hasPage && hasData && hasContent
		},
		buildIndexEntry( item ) {
			
			const { content,
				data:{ title, order, layout }} = item
			
			return {
				_id: getItemIdentifier(item),
				type,
				order,
				title,
				layout,
				content
			}
		}
	}
}