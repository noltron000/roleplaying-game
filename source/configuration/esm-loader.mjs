import {resolve as tsNodeResolve} from 'ts-node/esm'
import * as tsConfigPaths from 'tsconfig-paths'
import {pathToFileURL} from 'url'

// Load the paths from the configured tsconfig files.
const result = tsConfigPaths.loadConfig( )

// Ensure there the tsconfig was loaded correctly.
if (result.resultType === 'failed') {
	throw new Error(
		`Failed to load tsconfig: ${result.message}`
	)
}

// Generate a function that checks for matched specifiers...
const {absoluteBaseUrl, paths} = result
const matchPath = tsConfigPaths
.createMatchPath(absoluteBaseUrl, paths)

/**
This resolves an import path using ts-node/esm.
It is a necessary experimental feature to bring harmony
	between typescript, ecma-script modules, and node.
**/
const resolve = (specifier, ...rest) => {
	// Find a valid match, if applicable.
	const match = matchPath(specifier)
	// Overwrite the specifier if there was a match.
	if (match != null) specifier = pathToFileURL(match).href
	// Feed results into the default ts-node resolver.
	return tsNodeResolve(specifier, ...rest)
}

export * from 'ts-node/esm'
export {resolve}
