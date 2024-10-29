type integer = number

type checkMethod<T> = (item: T) => boolean
type matchMethod<T> = (itemA: T, itemB: T) => boolean
type sortMethod<T> = (itemA: T, itemB: T) => number

export type {
	integer,
	checkMethod,
	matchMethod,
	sortMethod,
}
