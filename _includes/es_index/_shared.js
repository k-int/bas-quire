const { cleanId } = require('../../_plugins/elasticSearch/helpers')

module.exports = {
	getItemIdentifier: ({
		
		page: { url },
		data:{ title, key } }) => cleanId( url == "/" ? title.toLowerCase() : (key ?? url) ),
		
  normalizePalette: ( colourPalette ) => {
		
		if (!colourPalette) return {}
		if (typeof (colourPalette) === 'string') return { "main": colourPalette }
		
		// Assume array and expand each entry
		return Object.assign( ...colourPalette )
	},
				
	parseSections: (baseContent, spliton, psId, psContent) => {
			const indices = []

			baseContent.forEach((e, i) => {
				if (e.includes(spliton)) {
					indices.push(i)
				}
			})

			// Empty array.
			if (indices.length < 1) return []

			return indices.map(psIndex => {
				var collected = []
				const id = baseContent[psIndex]
				var hasEnded = false
				var plusIndex = 1
				// Get the data without the figures/contributors spaced between the paras
				while (hasEnded == false) {
					if (baseContent[psIndex + plusIndex]) {
						if (baseContent[psIndex + plusIndex].startsWith("{% assign") == true ||
							baseContent[psIndex + plusIndex].startsWith("{% backmatter")) {
							// if following is assign then there's no data so return
							hasEnded = true
						} else if (baseContent[psIndex + plusIndex].startsWith("{%") == true) {
							// if there is a tag after id
							plusIndex += 1
						} else {
							collected.push(baseContent[psIndex + plusIndex])
							plusIndex += 1
						}
					} else {
						hasEnded = true
					}
				}
				var collectedObj = { [psId]: id, [psContent]: collected }
				return collectedObj
			})
		}
			
}