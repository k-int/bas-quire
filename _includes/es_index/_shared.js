const { cleanId } = require('../../_plugins/elasticSearch/helpers')


const getItemIdentifier = ({

	page: { url },
	data: { title, key } }) => cleanId(url == "/" ? title.toLowerCase() : (key ?? url))

const normalizePalette = (colourPalette) => {

	if (!colourPalette) return {}
	if (typeof (colourPalette) === 'string') return { "main": colourPalette }

	// Assume array and expand each entry
	return Object.assign(...colourPalette)
}

const mapToKeys = (keys) => ((obj) => limitKeys(keys, obj))

const limitKeys = (keys, obj) => {

	if (!obj || !keys) return obj

	if (!Array.isArray(keys)) throw new Error("keys must be of type array")
	return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)))
}

const parseSections = (baseContent, spliton, psId, psContent, formatter) => {

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
					// get content and trim leading and trailing whitespace 
					// note: despite trimming, the text that has leading whitespace still produces errors and is treated as if whitespace still there
					const contentNoWhitespace = (baseContent[psIndex + plusIndex]).trim()

					// try catch to attempt formatting of md -> HTML, if errors occur then append md
					try {
						const formattedText = formatter(contentNoWhitespace)	
						collected.push(formattedText)
					}
					catch {
						console.log(`${contentNoWhitespace} failed to be converted to HTML, original markdown will be used instead.`)
						collected.push(contentNoWhitespace)
					}

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

const envConfig = require('dotenv').config({ path: './_plugins/elasticSearch/.env' });
const mediaUrl = process.env.MEDIA_URL

// Define the public API here..
module.exports = {
	cleanId, getItemIdentifier, mapToKeys, limitKeys, parseSections, normalizePalette, mediaUrl
}