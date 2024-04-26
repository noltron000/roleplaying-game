type integer = number

type checkMethod<T> = (item: T) => boolean
type matchMethod<T> = (itemA: T, itemB: T) => boolean
type sortMethod<T> = (itemA: T, itemB: T) => number

type Constructor <
	Instance = unknown,
	Arguments extends Array<unknown> = [ ],
> = new (...args: Arguments) => Instance

export type {
	integer,
	checkMethod,
	matchMethod,
	sortMethod,
	Constructor,
}
