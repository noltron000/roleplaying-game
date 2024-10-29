import type {TurnTracker} from '#classes/TurnTracker'

type ValArray <Val> = Val | Array<Val>

type StateEventName = (
	| 'activate-tracker'
	| 'deactivate-tracker'
	| 'start-round'
	| 'end-round'
)

type TurnEventName = (
	| 'add-turn'
	| 'remove-turn'
	| 'start-turn'
	| 'skip-turn'
	| 'end-turn'
)

/**
A currated set of the event names that are available
	for turn trackers. They are all strings.
**/
type EventName = (
	| StateEventName
	| TurnEventName
)

type StateEventCallback = (
	( ) => void
)

type TurnEventCallback <Turn> = (
	(turn: Turn) => void
)

type EventCallback <Turn> = (
	| StateEventCallback
	| TurnEventCallback<Turn>
)

type StateEventListener <Turn> = (
	(tracker: TurnTracker<Turn>) => void
)

type TurnEventListener <Turn> = (
	(tracker: TurnTracker<Turn>, turn: Turn) => void
)

type EventListener <Turn> = (
	| StateEventListener<Turn>
	| TurnEventListener<Turn>
)

type EventListeners <Turn> = (
	| Partial<Record<StateEventName, ValArray<StateEventListener<Turn>>>>
	| Partial<Record<TurnEventName, ValArray<TurnEventListener<Turn>>>>
)

/** A helper class for managing turn tracker events. */
class TurnTrackerEvents <Turn = unknown> {
	// Private property to store listeners of each event type.
	#listeners: Partial<Record<EventName, Array<Function>>>
	// Adding the tracker avoids the need to have it
	//	as a parameter in dispatched callbacks.
	#tracker: TurnTracker<Turn>

	/** Requires a reference to the turn tracker. */
	constructor (
		tracker: TurnTracker<Turn>,
		listeners?: EventListeners<Turn>,
	) {
		this.#listeners = { }
		this.#tracker = tracker

		if (listeners == null) return

		// We expect errors here as using `entries` jumbles up
		//	the typing system for `EventListenersInput`...
		Object.entries(listeners).forEach(([name, data]) => {
			if (typeof data === 'function') {
				const listener = data
				/* @ts-expect-error */
				this.addEventListener(name, listener)
			}
			else data.forEach((listener) => {
				/* @ts-expect-error */
				this.addEventListener(name, listener)
			})
		})
	}

	/** Adds an event listener to the call stack. */
	// Method Overload for addingtracker state events.
	addEventListener (
		name: StateEventName,
		listener: StateEventListener<Turn>,
	): void

	// Method Overload for adding tracker turn events.
	addEventListener (
		name: TurnEventName,
		listener: TurnEventListener<Turn>,
	): void

	// Primary method signature for adding event listeners.
	addEventListener (
		name: EventName,
		listener: EventListener<Turn>,
	): void {
		const listeners = (this.#listeners[name] ??= [ ])
		listeners.push(listener)
	}

	/** Removes an event listener from the call stack. */
	// Method Overload for removing tracker state events.
	removeEventListener (
		name: StateEventName,
		listener: StateEventListener<Turn>,
	): void

	// Method Overload for removing tracker turn events.
	removeEventListener (
		name: TurnEventName,
		listener: TurnEventListener<Turn>,
	): void

	// Primary method signature for removing event listeners.
	removeEventListener (
		name: EventName,
		listener: EventListener<Turn>,
	): void {
		const listeners = this.#listeners[name] ?? [ ]
		const index = listeners.indexOf(listener)
		if (index !== -1) listeners.splice(index, 1)
		if (listeners.length === 0) delete this.#listeners[name]
	}

	/** Returns a function to execute a stack of callbacks. */
	// Method Overload for dispatching state events.
	#dispatchEvent (name: StateEventName): StateEventCallback

	// Method Overload for dispatching turn events.
	#dispatchEvent (name: TurnEventName): TurnEventCallback<Turn>

	// Primary method signature for dispatching events.
	#dispatchEvent (name: EventName): EventCallback<Turn> {
		// Returns a function to execute a stack of callbacks.
		return (...parameters: Array<unknown>) => {
			const listeners = this.#listeners[name] ?? [ ]
			listeners.forEach((callback) => {
				// Notice how `#tracker` is added as an argument.
				callback(this.#tracker, ...parameters)
			})
		}
	}

	// Tracker State Events //
	onActivateTracker( ) {this.#dispatchEvent('activate-tracker')( )}
	onDeactivateTracker( ) {this.#dispatchEvent('deactivate-tracker')( )}
	onStartRound( ) {this.#dispatchEvent('start-round')( )}
	onEndRound( ) {this.#dispatchEvent('end-round')( )}

	// Turn State Events //
	onAddTurn(turn: Turn) {this.#dispatchEvent('add-turn')(turn)}
	onRemoveTurn(turn: Turn) {this.#dispatchEvent('remove-turn')(turn)}
	onStartTurn(turn: Turn) {this.#dispatchEvent('start-turn')(turn)}
	onSkipTurn(turn: Turn) {this.#dispatchEvent('skip-turn')(turn)}
	onEndTurn(turn: Turn) {this.#dispatchEvent('end-turn')(turn)}
}

export {TurnTrackerEvents}
export type {EventName, EventListeners}
