import type {
	matchMethod,
	sortMethod,
} from '#types/aliases.d.mts'

interface SortedListArgs <Item> {
	sortMethod: sortMethod<Item>,
	matchMethod?: matchMethod<Item>,
	items?: Array<Item>,
}

/** A list that is guarenteed to remain in sorted order. */
class SortedList <Item = unknown> {
	#sortMethod: sortMethod<Item>
	#matchMethod: matchMethod<Item>
	#sortedList: Array<Item> = [ ]

	/**
	While creating a sorted list, you must specify a
		sort method for the internal list to abide by.
	You may also specify a match method, which can be
		optionally used to check if two list items are equal.

	---

	@param args
	<!-- Used for tracking the spread arguments. --->

	---

	@param args.sortMethod
	The sort method which the list abides by.

	---

	@param args.matchMethod
	_Optional._
	How the list determines item equality.
	Used to find matching items with `this.remove( )`.

	---

	@param args.items
	_Optional._
	If specified, these items will be added to the list.
	**/
	constructor ({
		sortMethod,
		matchMethod = (a, b) => (a === b),
		items = [ ],
	}: SortedListArgs<Item>) {
		this.#sortMethod = sortMethod
		this.#matchMethod = matchMethod
		this.add(...items)
	}

	/** Provides a read-only copy of the sorted list. */
	get list ( ) {return [...this.#sortedList] as const}

	/** Sorts the list. Accessible on class instances. */
	sort ( ) {this.#sortedList.sort(this.#sortMethod)}

	/**
	Adds one or more items to the list,
		while maintaining sort order.
	**/
	add (...items: Array<Item>) {
		this.#sortedList.push(...items)
		this.sort( )

		// Return all additions.
		return [...items] as const
	}

	/**
	Removes one or more items from the list.
	If multiple matches exist for a single item,
		then only the first match is removed from the list.
	**/
	remove (...items: Array<Item>) {
		// Track and return all successfully removed items.
		const removals: Array<Item> = [ ]

		items.forEach((item) => {
			// Find the first element that matches the item.
			const index = this.#sortedList.findIndex((target) => (
				this.#matchMethod(target, item)
			))

			// Remove the element at the matched index.
			if (index >= 0) {
				const removed = this.#sortedList.splice(index, 1)
				if (removed.length > 0) removals.push(item)
			}
		})

		return [...removals] as const
	}
}

export {SortedList}
export type {SortedListArgs}
