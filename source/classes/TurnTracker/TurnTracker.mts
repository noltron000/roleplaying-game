import JSON5 from 'json5'

import {SortedList} from '#classes/Lists'
import {makeTable} from '#tools/tables'

import type {SortedListArgs} from '#classes/Lists'
import type {integer, checkMethod} from '#types/aliases'

/** A Turn containing index metadata. Can be nullish. */
type MetaTurn<Type> = {index: integer, turn: Type} | null

/** Describes a turn's index relative to the current turn. */
type TurnRelation = (
	| 'first-turn'
	| 'next-turn'
	// | 'previous-turn' // UNSUPPORTED
	// | 'last-turn' // UNSUPPORTED
)

interface TurnTrackerArgs<Turn>
extends SortedListArgs<Turn> {
	filterMethod?: checkMethod<Turn>,
}

const invalidTurnError = new Error(
	'Either the turn index is out of range, ' +
	'or the turn is undefined!'
)

/**
The __TurnTracker__ class is an abstraction of a
	round-robin-style turn tracker.
**/
class TurnTracker<Turn = unknown> {
	#listRef: SortedList<Turn>
	#filterMethod: checkMethod<Turn>
	#current: MetaTurn<Turn> = null
	#turnCounter: integer = 0
	#roundCounter: integer = 0

	/**
	Creates an instance of a __TurnTracker__, to be used for
		tracking a round-robin-style turn-based activity.

	---

	@param args
	<!-- Used for tracking the spread arguments. --->

	---

	@param args.sortMethod
	Determines how a pair of turns are given priority.
	Usually, you will want the turn with the higher _"rank"_
		to go first, whatever that means for your application.

	---

	@param args.matchMethod
	_Optional._
	Determines whether a pair of turns are equal or not.
	By default, this just uses JavaScript's "`===`" operator.

	---

	@param args.filterMethod
	_Optional._
	Determines which turns to filter out, when cycling
		through the internal list of turns.
	By default, this returns `true`, and keeps all turns.

	---

	@param args.items
	_Optional._
	When creating an instance, you may optionally
		specify some turns to add to the tracker's queue.
	**/
	constructor ({
		filterMethod = ( ) => true,
		items = [ ],
		...args
	}: TurnTrackerArgs<Turn>) {
		this.#listRef = new SortedList(args)
		this.#filterMethod = filterMethod
		this.add(...items)
	}

	/* *********************** */
	/* # MAINTENANCE METHODS # */
	/* *********************** */

	/**
	Automatically handles turn transitions.

	The logic may appear somewhat intimidating to understand,
		so try to understand each conditional block on its own.
	Then, it may become more apparent, as they contain simple
		sequential scripts that describe the tracker's state.

	---

	@param original
	The current turn with index metadata.
	A `null` value means there is no turn selected.

	---

	@param upcoming
	The next turn with index metadata.
	A `null` value indicates an intent
		to deactivate the tracker.

	---

	@param options
	_Optional._
	Additional options to specify the method's behavior.

	---

	@param options.skip
	_Optional._
	If a turn is skipped, the counter doesn't increment.
	**/
	#safelyCycleTurn (
		original: MetaTurn<Turn>,
		upcoming: MetaTurn<Turn>,
		{skip = false} = { }, // Options
	) {
		// The tracker is inactive and remains inactive.
		if (original == null && upcoming == null) {
			return
		}
		// Activate the tracker (it is deactivated).
		else if (original == null) {
			// TypeScript thinks `upcoming` can be nullish.
			upcoming = upcoming! // It can't - tell TypeScript!
			this.#current = upcoming
		}
		// Deactivate the tracker (it is activated).
		else if (upcoming == null) {
			this.#current = upcoming
			this.#roundCounter++
		}
		// The upcoming turn is ahead of the original turn.
		else if (upcoming.index > original.index) {
			this.#current = upcoming
			skip || this.#turnCounter++
		}
		// The upcoming turn is behind the orginal turn.
		else {
			this.#current = upcoming
			this.#roundCounter++
			skip || this.#turnCounter++
		}
	}

	/**
	Runs a callback safely, keeping the data structure intact.

	---

	@param callback
	The callback is expected to mutate the list.
	It can take one of two forms:
	- It can add many turns to the list and move turns around.
	- Or, it can remove one (and only one) turn from the list.

	__Notice:__
	The callback's logic should not be mixed and matched.
	It should take only one of the aforementioned forms,
		otherwise the current turn index can be scrambled!
	**/
	#safelyRunWithSideEffects (callback: ( ) => void) {
		// Gather the "original" and "upcoming" turn list states
		//	to determine whether turns were added or removed.
		const originalTurns = this.turns
		callback( ) // Execute the callback.
		const upcomingTurns = this.turns

		// Gather the "original" and "upcoming" turn states
		//	to determine whether the current turn shifted.
		const original = this.#current
		if (original == null) return // Tracker was disabled.
		const upcoming = this.getEntryAt(original.index)

		// This determines if the original turn is still valid.
		const originalIsValid = this.#filterMethod(original.turn)

		// This determines the new index of the original turn.
		let shiftedIndex; {
			shiftedIndex = upcomingTurns.indexOf(original.turn)
			if (shiftedIndex === -1) shiftedIndex = undefined
		}

		// The original turn hasn't shifted at all.
		if (originalIsValid && original.turn === upcoming?.turn) {
			return // No need to touch any variables.
		}

		// The original turn has shifted to a new index.
		else if (originalIsValid && shiftedIndex != null) {
			this.#current = {
				index: shiftedIndex,
				turn: original.turn,
			} as const
		}

		// The original turn was deleted. Skip the turn!
		else {
			this.#safelyCycleTurn(
				original,
				upcoming,
				{skip: true},
			)
		}
	}

	/* ******************************* */
	/* # GETTER PROPERTIES & METHODS # */
	/* ******************************* */

	/** Provides a readonly copy of the turn tracker. */
	get turns ( ) {return this.#listRef.list}

	/** Determines if the tracker is set to active. */
	get active ( ) {return this.#current != null}

	/** Sets the active status of the tracker. */
	set active (value) {
		const original = this.#current

		// Activate the tracker.
		if (value === true) {
			const upcoming = this.getEntryAt('next-turn')
			if (original !== null || upcoming === null) return
			this.#safelyCycleTurn(null, upcoming)
		}

		// Deactivate the tracker.
		else if (value === false) {
			if (original === null) return
			this.#safelyCycleTurn(original, null, {skip: true})
		}
	}

	/** Points to the current turn in the turn list. */
	get currentIndex ( ) {
		if (this.#current == null) return null
		else return this.#current.index
	}

	/** Obtains the current turn, if there is one. */
	get currentTurn ( ) {
		if (this.#current == null) return null
		else return this.#current.turn
	}

	/** Represents how many turns have passed. */
	get turnCounter ( ) {return this.#turnCounter}

	/** Represents how many rounds have passed. */
	get roundCounter ( ) {return this.#roundCounter}

	/** The numeric representation of the current turn. */
	get turnOrdinal ( ) {return this.turnCounter + 1}

	/** The numeric representation of the current round. */
	get roundOrdinal ( ) {return this.roundCounter + 1}

	/**
	Provides the index of the next turn,
		if a valid turn exists in the tracker.

	---

	@returns
	This method returns an index pointing to a turn in the
		tracker, with a single exception…
	If the tracker is empty or has no valid turns, then a
		`null` value gets returned, instead.
	This represents the intentional absence of a turn.
	**/
	getEntryAt (
		index: integer | TurnRelation | null
	): MetaTurn<Turn> {
		// An empty tracker contains no turns.
		if (index == null || this.turns.length === 0) return null

		let sliceIndex = 0 // Named for more clarity.

		// Check for a relative index input,
		//	or sanitize a numeric index input.
		if (typeof index === 'number') {
			sliceIndex = Math.max(index, 0)
		}
		else if (index === 'next-turn') {
			if (this.#current == null) sliceIndex = 0
			else sliceIndex = this.#current.index + 1
		}

		// Slice current turns into two parts,
		//	then get the next turn and first turn.
		const nextTurns = this.turns.slice(sliceIndex)
		const prevTurns = this.turns.slice(0, sliceIndex)

		const nextIndex = nextTurns.findIndex(this.#filterMethod)
		const firstIndex = prevTurns.findIndex(this.#filterMethod)
		let foundIndex

		if (nextIndex !== -1) foundIndex = sliceIndex + nextIndex
		else if (firstIndex !== -1) foundIndex = firstIndex
		else return null

		const foundTurn = this.turns.at(foundIndex)
		if (foundTurn === undefined) throw invalidTurnError
		return {index: foundIndex, turn: foundTurn} as const
	}

	/* ************************ */
	/* # LIST MUTATOR METHODS # */
	/* ************************ */

	/**
	Adds one or more turns to the list, while maintaining
		sort-order and tracking the current turn index.
	**/
	add (...turns: Array<Turn>) {
		// Remove duplicates from the input.
		// Each of the tracker's turns should be unique.
		turns = turns.filter((turn, index) => (
			// The internal list cannot include the turn already.
			!this.turns.includes(turn) &&
			// The input cannot include any turn more than once.
			!turns.slice(index + 1).includes(turn)
		))

		// Safely add the specified turns, one-at-a-time.
		turns.forEach((turn) => {
			const callback = ( ) => this.#listRef.add(turn)
			this.#safelyRunWithSideEffects(callback)
		})

		return [...turns] as const
	}

	/**
	Removes one or more turns from the list,
		while tracking the current index.
	If the current tracked turn is removed,
		it gets skipped for the next turn.
	**/
	remove (...turns: Array<Turn>) {
		const removals: Array<Turn> = [ ]

		// Safely remove the specified turns, one-at-a-time.
		turns.forEach((turn) => {
			const callback = ( ) => {
				const removed = this.#listRef.remove(turn)
				if (removed.length > 0) removals.push(turn)
			}
			this.#safelyRunWithSideEffects(callback)
		})

		return [...removals] as const
	}

	/**
	Sorts the turn list, while maintaining sort-order
		and tracking the current turn index.
	This is available to class instances, in case a turn's
		properties change (affecting sort-order).
	**/
	sort ( ) {
		const callback = ( ) => this.#listRef.sort( )
		return this.#safelyRunWithSideEffects(callback)
	}

	/* ************************ */
	/* # INDEX CYCLER METHODS # */
	/* ************************ */

	/** Increments turn & round cyclers as necessary. */
	next ( ) {
		const current = this.#current
		const upcoming = this.getEntryAt('next-turn')
		this.#safelyCycleTurn(current, upcoming)
	}

	/* ***************************** */
	/* # METADATA ACCESSOR METHODS # */
	/* ***************************** */

	/** Creates a human readable string with the tracker. */
	toString ( ) {
		return (
			'------------------------------------\n\n' +
			`current index:\t${this.currentIndex}\n` +
			`current turn:\t${this.currentTurn}\n` +
			`turn number:\t${this.turnOrdinal}\n` +
			`round number:\t${this.roundOrdinal}\n` +
			makeTable(this.turns)
		)
	}

	/** Generates a representation of the tracker's data. */
	toData ( ) {
		return {
			turns: this.turns,
			currentIndex: this.currentIndex,
			turnCounter: this.turnCounter,
			roundCounter: this.roundCounter,
		} as const
	}

	/** Emits a JSON-ified representation of the tracker. */
	toJSON ( ) {return JSON.stringify(this.toData( ))}

	/** Emits a JSON5-ified representation of the tracker. */
	toJSON5 ( ) {return JSON5.stringify(this.toData( ))}
}

export {TurnTracker}
export type {TurnTrackerArgs}
