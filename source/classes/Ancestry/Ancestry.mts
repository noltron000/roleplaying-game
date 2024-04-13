type Properties <Data> = (
	| {
		parent: Ancestor<Data>
		data?: Data | undefined
	}
	| {
		parent?: undefined
		data: Data
	}
)

class Ancestor <Data> {
	#properties: Properties<Data>

	constructor (properties: Properties<Data>) {
		this.#properties = properties
	}

	set properties (newData: Data) {
		this.#properties.data = newData
	}

	get properties ( ): Data {
		if (this.#properties.data !== undefined) {
			return this.#properties.data
		}
		else if (this.#properties.parent !== undefined) {
			return this.#properties.parent.properties
		}
		else {
			return this.#properties.data
		}
	}

	get parent ( ) {return this.#properties.parent}

	isRoot ( ) {return this.parent !== undefined}

	getAncestors ( ): Readonly<Array<Ancestor<Data>>> {
		const ancestors: Array<Ancestor<Data>> = [ ]

		let currentAncestor = this.parent
		while (currentAncestor != null) {
			ancestors.push(currentAncestor)
			currentAncestor = currentAncestor.parent
		}

		return ancestors
	}

	getAdopted (parent: Ancestor<Data>) {
		throw new Error('A parent can\'t get adopted by its own child!')
	}

	getOrphaned ( ) {
	}
}

const parent = new Ancestor({data: 'parent'})
const self = new Ancestor({data: 'self', parent: parent})
const child = new Ancestor({data: 'child', parent: self})
