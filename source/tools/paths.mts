import fs from 'fs/promises'
import tsConfigPaths from 'tsconfig-paths'

// Load the paths from the configured tsconfig files.
const result = tsConfigPaths.loadConfig( )

// Ensure there the tsconfig was loaded correctly.
if (result.resultType === 'failed') {
	throw new Error(
		`Failed to load tsconfig: ${result.message}`
	)
}

// Generate a function that checks for matched paths.
// This will handle cases like relative paths and aliases.
const {absoluteBaseUrl, paths} = result

/**
Reads a relative path or path alias from the params,
	and converts it into an absolute path.
**/
const matchPath = tsConfigPaths
.createMatchPath(absoluteBaseUrl, paths)

/**
Reads a file from the system.
Use `.toString( )` on the result to get its raw text.
**/
const readFile = async (
	filePath: string,
) => {
	// Check if the path is an alias or relative, etc.
	const match = matchPath(filePath)
	if (match != null) filePath = match

	// Finally, read the file to get the buffer.
	return await fs.readFile(filePath)
}

export {matchPath, readFile}
