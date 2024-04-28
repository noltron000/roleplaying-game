import {AbstractBilateralTree} from './AbstractTrees/index.mts'
import {AdoptionOptions, Tree} from './index.mts'

class RootedTree <Data = never> extends Tree<Data>
implements AbstractBilateralTree<Data> {
	protected _root: this = this

	/* ********************* */
	/* # GETTER PROPERTIES # */
	/* ********************* */

	/**
	Collects this tree's root, which can be itself.
	This property is an alias for `this.getRoot( )`.
	**/
	get root ( ): this {
		return this.getRoot( )
	}

	/* ******************** */
	/* # MUTATION METHODS # */
	/* ******************** */

	protected override _forceAdoption (target: this): boolean {
		return super._forceAdoption(target, target._root)
	}

	override add (target: this): boolean {
		const success = super.add(this._root, target, target._root)
		if (success) {
			target.traverse((tree) => {
				tree._root = this._root
			})
		}
		return success
	}

	override prune (target: this): boolean {
		const success = this._children.has(target)
		if (success) {
			target.traverse((tree) => {
				tree._root = target
			})
		}
		return super.prune(target)
	}

	override create (data?: Data): this {
		const child = super.create(data)
		child._root = this._root
		return child
	}

	/* ************************* */
	/* # INTROSPECTION METHODS # */
	/* ************************* */

	override isChild ( ): boolean {
		return super.isChild(this._root)
	}

	override isRoot ( ): boolean {
		return super.isRoot(this._root)
	}

	/* ******************** */
	/* # RELATION METHODS # */
	/* ******************** */

	override hasParent (target: this): boolean {
		return super.hasParent(target, this._root)
	}

	override hasAncestor (target: this): boolean {
		return super.hasAncestor(target, this._root)
	}

	override hasRoot (target: this): boolean {
		return super.hasRoot(target, this._root)
	}

	override hasRelative (target: this): boolean {
		return super.hasRelative(target, this._root)
	}

	/* ********************** */
	/* # COLLECTION METHODS # */
	/* ********************** */

	override getParent ( ): this | null {
		return super.getParent(this._root)
	}

	override getAncestors ( ): ReadonlyArray<this> {
		return super.getAncestors(this._root)
	}

	override getRoot ( ): this {
		return super.getRoot(this._root)
	}

	override getRelatives ( ): ReadonlyArray<this> {
		return super.getRelatives(this._root)
	}
}

export {RootedTree}
