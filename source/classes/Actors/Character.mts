interface ActorDetails {
	type: string,
	size: string,
	youth: string,
}

interface CharacterDetails {
	name: string,
	family?: string,

	species: string,
	race: string,
	type: string,

	age: number,
	weight: number,
	gender: string,

	size: string,
	youth: string,

	skinColor: string,
	eyeColor: string,
	hairColor: string,
	patterns?: string, // natural skin and fur patterns.

	scars?: string,
	tattoos?: string, // includes temporary war paint.
	piercings?: string,
	notables?: string, // includes glasses, smoke pipes, etc.
}

interface BodyTypeTemplate {
	species: string,
	type: string,

	lifeRange: {low: number, high: number},
	weightRange: {low: number, high: number},
	ageCurve: string, // dice
	weightCurve: string, // dice

	size: string, // Always one size.
	youthTiers: {
		young: number, // <20
		adult: number, // >20
		elder: number, // >60
	}

	skinColor: Array<string>
	eyeColor: Array<string>
	hairColor: Array<string>
}
