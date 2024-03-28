import readline from 'readline'
import util from 'util'
import {stdin, stdout} from 'node:process'

/** Using the CLI, this poses a prompt to the user. */
const prompt = async (arg = '') => {
	// Create a readline interface...
	const rli = readline.createInterface({
		input: stdin,
		output: stdout,
	})

	// Generate the questioner function.
	const question = util.promisify(rli.question).bind(rli)

	// Get an answer, then close the interface.
	const answer = await question(arg)
	rli.close( )

	/* @ts-expect-error */ // Return the answer.
	return answer as string
}

export {prompt}
