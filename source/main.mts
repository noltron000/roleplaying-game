import JSON5 from 'json5'
import {readFile} from '#tools/paths'

const buffer = await readFile('#data/weapon-names.json5')
const testData = JSON5.parse(buffer.toString( ))

console.table(testData)
