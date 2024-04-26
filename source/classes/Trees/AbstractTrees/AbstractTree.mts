import type {
	GraphPath,
	VisitFx,
	TraversalOptions,
} from '../index.mts'

abstract class AbstractTree <Data = never> {
	abstract data?: Data | undefined
	constructor (data?: Data) { }

	/* ********************* */
	/* # GETTER PROPERTIES # */
	/* ********************* */

	/** Counts this tree's children. */
	abstract get size ( ): number

	/**
	Provides this tree's children in an array.
	This property is an alias for `this.getChildren( )`.
	**/
	abstract get children ( ): ReadonlyArray<this>

	/* ******************** */
	/* # MUTATION METHODS # */
	/* ******************** */

	/**
	Attempts to add a specified target node to this tree.
	The target must not be be related to this tree, and cannot
		be a child of another node (ie, it must be a root node).
	If the target node cannot be added to this tree,
		then the value `false` is returned by this method.

	---

	@param target
	The target node to be added to this tree.

	---

	@param root
	The root node of this tree.

	---

	@param targetRoot
	The root node of the specified target.

	---

	@returns
	The returned value represents whether or not the target
		was successfully added to this tree.
	**/
	abstract add (
		target: this,
		root: this,
		targetRoot: this,
	): boolean

	/**
	If the target node is a child of this tree, it is deleted.
	If it is deleted successfully, then its children are also
		adopted by this tree (which differs from `this.prune`).
	**/
	abstract delete (target: this): boolean

	/**
	If the target node is a child of this tree, it is deleted.
	Even if it is deleted successfully, it gets to keep its
		children (which differs from `this.delete`).
	**/
	abstract prune (target: this): boolean

	/**
	Creates a new instance of a tree as a child node.
	The new child node is returned by this method; however,
		if this tree cannot add the child, `null` is returned.
	**/
	abstract create ( ): this | null

	/* ************************* */
	/* # INTROSPECTION METHODS # */
	/* ************************* */

	/** Determines if this tree is a parent node. */
	abstract isParent ( ): boolean
	/** Determines if this tree is a leaf node. */
	abstract isLeaf ( ): boolean

	// LOOK-BEHIND FEATURES //

	/** Determines if this tree is a child node. */
	abstract isChild (root: this): boolean
	/** Determines if this tree is a root node. */
	abstract isRoot (root: this): boolean

	/* ******************** */
	/* # RELATION METHODS # */
	/* ******************** */

	/**
	Determines if this tree has a given child node.
	The method is an alias for `this.hasChild( )`.
	**/
	abstract has (target: this): boolean

	/** Determines if this tree has a given child node. */
	abstract hasChild (target: this): boolean
	/** Determines if this tree has a given descendant. */
	abstract hasDescendant (target: this): boolean
	/** Determines if this tree has a given leaf node. */
	abstract hasLeaf (target: this): boolean

	// LOOK-BEHIND FEATURES //

	/** Determines if this tree has a given parent node. */
	abstract hasParent (target: this, root: this): boolean
	/** Determines if this tree has a given ancestor. */
	abstract hasAncestor (target: this, root: this): boolean
	/** Determines if this tree has a given root node. */
	abstract hasRoot (target: this, root: this): boolean

	/** Determines if this tree has a given relative. */
	abstract hasRelative (target: this, root: this): boolean

	/* ********************** */
	/* # COLLECTION METHODS # */
	/* ********************** */

	/** Collects this tree's children in an array. */
	abstract getChildren ( ): ReadonlyArray<this>
	/** Collects this tree's descendants in an array. */
	abstract getDescendants ( ): ReadonlyArray<this>
	/** Collects this tree's leaves in an array. */
	abstract getLeaves ( ): ReadonlyArray<this>

	// LOOK-BEHIND FEATURES //

	/** Collects this tree's parent, if it has one. */
	abstract getParent (root: this): this | null
	/** Collects this tree's ancestors in an array. */
	abstract getAncestors (root: this): ReadonlyArray<this>
	/** Collects this tree's root, which can be itself. */
	abstract getRoot (root: this): this

	/** Collects all of this tree's relatives in an array. */
	abstract getRelatives (root: this): ReadonlyArray<this>

	/* ********************* */
	/* # TRAVERSAL METHODS # */
	/* ********************* */

	/** Obtains a path to the given target descendant node. */
	abstract findPathTo (target: this): GraphPath<this> | null

	/**
	Traverses the tree and runs a given function, `visitFx`.
	Optionally, you may specify whether it traverses the tree
		using a *"breadth-first"* or *"depth-first"* approach.

	---

	@param visitFx
	A function that runs on each step of traversal, which can
		take in the current node and its metadata as parameters.
	It can return `true` to stop traversing the tree;
		in this way, it can be used as a search method.

	---

	@param options
	<!-- Used for optional additions. --->

	---

	@param options.approach
	_Optional._
	Can be set to either *"breadth-first"* or *"depth-first"*.

	---

	@returns
	The returned boolean determines whether the given visit
		function, `visitFx`, returned `true` with any node.
	**/
	abstract traverse (
		visitFx: VisitFx<this>,
		options: TraversalOptions,
	): boolean
}

export {AbstractTree}
