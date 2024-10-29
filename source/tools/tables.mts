import {Console} from 'node:console'
import {Transform} from 'node:stream'
import type {TransformCallback} from 'node:stream'

const transform = (
	chunk: unknown,
	encoding: BufferEncoding,
	callback: TransformCallback
) => {
	callback(null, chunk)
}

const transformer = new Transform({transform: transform})
const logger = new Console({stdout: transformer})

const makeTable = (data: unknown) => {
	logger.table(data)
	return (transformer.read( ) || '').toString( )
}

export {makeTable}
