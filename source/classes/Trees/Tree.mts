import {AbstractTree} from './index.mts'

import type {Constructor} from '#types/aliases'
import type {
	GraphPath,
	VisitData,
	VisitFx,
	TraversalOptions,
	AdoptionOptions,
} from './index.mts'

const missingPath = new Error(
	'There is no path to the descendant node!',
)

class Tree <Data = never> extends AbstractTree<Data> {
	protected _children: Set<this> = new Set( )
	data?: Data | undefined

	constructor (data?: Data) {
		super(data) // Dummy constructor; does nothing.
		this.data = data
	}

	/* ********************* */
	/* # GETTER PROPERTIES # */
	/* ********************* */

	get size ( ): number {
		return this._children.size
	}

	get children ( ): ReadonlyArray<this> {
		return [...this._children]
	}

	/* ******************** */
	/* # MUTATION METHODS # */
	/* ******************** */

	#dangerouslyAdd (target: this): boolean {
		if (this.has(target)) return false
		this._children.add(target)
		return true
	}

	protected _forceAdoption (
		target: this,
		targetRoot: this,
	): boolean {
		const targetParent = target.getParent(targetRoot)
		targetParent?.prune(target)
		return this.#dangerouslyAdd(target)
	}

	add (
		target: this,
		root: this,
		targetRoot: this,
	): boolean {
		// Determine that the target has no parent,
		//	and is not related to this tree.
		if (
			target.isChild(targetRoot) ||
			this.hasRelative(target, root)
		) {return false}

		this._children.add(target)
		return true
	}

	delete (target: this): boolean {
		const success = this.prune(target)
		if (success) { // Adopt the target's children.
			target.children.forEach((child) => {
				this._forceAdoption(child, target)
			})
		}
		return success
	}


	prune (target: this): boolean {
		// The target keeps its children here.
		return this._children.delete(target)
	}

	create (data?: Data): this {
		// * NOTE * * * * * * * * * * * * * * * * * * * * * * *
		// * Sadly, we must cast `this.constructor`, as it has
		// *	an ambiguous type `Function`; not a constructor...
		// * Neither can we obtain strongly-typed arguments by
		// *	the likes of `ConstructorParameters<typeof this>`.
		const Class = this.constructor as (
			// We'll make do by using this custom type.
			Constructor<this, [data?: Data]>
		)
		const child = new Class(data)
		this.#dangerouslyAdd(child)
		return child
	}

	/* ************************* */
	/* # INTROSPECTION METHODS # */
	/* ************************* */

	isParent ( ): boolean {
		return this.size > 0
	}

	isLeaf ( ): boolean {
		return this.size === 0
	}

	// LOOK-BEHIND FEATURES //

	isChild (root: this): boolean {
		return this.getParent(root) !== null
	}

	isRoot (root: this): boolean {
		return this.getRoot(root) === this
	}

	/* ******************** */
	/* # RELATION METHODS # */
	/* ******************** */

	has (target: this): boolean {
		return this._children.has(target)
	}

	hasChild (target: this): boolean {
		return this.has(target)
	}

	hasDescendant (target: this): boolean {
		// A tree can't be its own descendant.
		if (this === target) return false
		const predicate = (tree: this) => {
			return tree === target
		}
		return this.traverse(predicate)
	}

	hasLeaf (target: this): boolean {
		// Check if the target is a leaf.
		if (!target.isLeaf( )) return false
		// Then, check if the target is in this tree.
		if (this === target) return true
		return this.hasDescendant(target)
	}

	// LOOK-BEHIND FEATURES //

	hasParent (target: this, root: this): boolean {
		return this.getParent(root) === target
	}

	hasAncestor (target: this, root: this): boolean {
		return this.getAncestors(root).includes(target)
	}

	hasRoot (target: this, root: this): boolean {
		return this.getRoot(root) === target
	}

	hasRelative (target: this, root: this): boolean {
		// Both `this` and `target` must either be descendants
		//	of the root, or be the actual root itself.
		let foundThis = false
		let foundTarget = false
		const predicate = (tree: this) => {
			if (tree === this) foundThis = true
			if (tree === target) foundTarget = true
			if (foundThis && foundTarget) return true
			return false
		}

		return root.traverse(predicate)
	}

	/* ********************** */
	/* # COLLECTION METHODS # */
	/* ********************** */

	getChildren ( ): ReadonlyArray<this> {
		return this.children
	}

	getDescendants ( ): ReadonlyArray<this> {
		const descendants: Array<this> = [ ]
		const mutator = (tree: this) => {
			// A tree cannot be its own descendant.
			if (this !== tree) descendants.push(tree)
		}
		this.traverse(mutator)
		return descendants
	}

	getLeaves ( ): ReadonlyArray<this> {
		const leaves: Array<this> = [ ]
		const mutator = (tree: this) => {
			if (tree.isLeaf( )) leaves.push(tree)
		}
		this.traverse(mutator)
		return leaves
	}

	// LOOK-BEHIND FEATURES //

	getParent (root: this): this | null {
		const ancestors = this.getAncestors(root)
		return ancestors.at(-1) ?? null
	}

	getAncestors (root: this): ReadonlyArray<this> {
		const path = root.findPathTo(this)
		if (path == null) throw missingPath
		return path.slice(0, -1)
	}

	getRoot (root: this): this {
		const path = root.findPathTo(this)
		if (path == null) throw missingPath
		return path.at(0)!
	}

	getRelatives (root: this): ReadonlyArray<this> {
		const relatives = [root, ...root.getDescendants( )]
		return relatives
	}

	/* ********************* */
	/* # TRAVERSAL METHODS # */
	/* ********************* */

	findPathTo (target: this): GraphPath<this> | null {
		let path: GraphPath<this> | null = null
		const mutator = (tree: this, data: VisitData<this>) => {
			if (tree === target) {
				path = data.path
				return true // Exit early
			}
			return false
		}
		this.traverse(mutator)
		return path
	}

	traverse (
		visitFx: VisitFx<this>,
		options: TraversalOptions = {approach: 'breadth-first'},
	): boolean {
		// This paths array starts with just this tree itself;
		//	all other paths branch off from this tree.
		const pendingPaths: Array<GraphPath<this>> = [[this]]

		// The pending paths array can act like either a stack
		//	or a queue, depending on this remove method.
		const next = ( ) => {
			switch (options.approach) {
				case ('breadth-first'): {return pendingPaths.pop( )}
				case ('depth-first'): {return pendingPaths.shift( )}
			}
		}

		// Take the current path from the pending array.
		let currentPath: GraphPath<this> | undefined
		while ((currentPath = next( )) != null) {
			// Get the current node and its metadata.
			const current = currentPath.at(-1)!
			const metadata = {
				path: currentPath,
				depth: currentPath.length - 1,
			}

			// Visit the current node with optional metadata.
			const breakout = visitFx(current, metadata)
			// Note, `visitFx` can be a predicate to exit early.
			if (breakout === true) return true

			// Add child paths to the pending array.
			current.children.forEach((child) => {
				const childPath: GraphPath<this> = [
					...currentPath!,
					child,
				]
				pendingPaths.push(childPath)
			})
		}

		return false // Loop completed.
	}
}

export {Tree}
