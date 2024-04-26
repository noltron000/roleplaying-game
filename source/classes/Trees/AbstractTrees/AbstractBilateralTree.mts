import {AbstractTree} from './index.mts'

abstract class AbstractBilateralTree <Data = never>
extends AbstractTree<Data> {
	/* ******************** */
	/* # MUTATION METHODS # */
	/* ******************** */

	abstract override add (target: this): boolean

	/* ************************* */
	/* # INTROSPECTION METHODS # */
	/* ************************* */

	abstract override isChild ( ): boolean
	abstract override isRoot ( ): boolean

	/* ******************** */
	/* # RELATION METHODS # */
	/* ******************** */

	abstract override hasParent (target: this): boolean
	abstract override hasAncestor (target: this): boolean
	abstract override hasRoot (target: this): boolean

	abstract override hasRelative (target: this): boolean

	/* ********************** */
	/* # COLLECTION METHODS # */
	/* ********************** */

	abstract override getParent ( ): this | null
	abstract override getAncestors ( ): ReadonlyArray<this>
	abstract override getRoot ( ): this

	abstract override getRelatives ( ): ReadonlyArray<this>

	/* ********************* */
	/* # TRAVERSAL METHODS # */
	/* ********************* */
}

export {AbstractBilateralTree}
