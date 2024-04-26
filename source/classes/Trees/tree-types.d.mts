type GraphPath <Node = unknown> = Readonly<[
	root: Node,
	...rest: Array<Node>
]>

type VisitData <Node = unknown> = Readonly<{
	depth: number,
	path: GraphPath<Node>,
}>

type VisitFx <Node = unknown> = (
	node: Node,
	data: VisitData<Node>,
) => boolean | void

type TraversalApproach = 'breadth-first' | 'depth-first'

type TraversalOptions = Readonly<{
	approach: TraversalApproach,
}>

type AdoptionOptions = Readonly<{
	forceAdoption: boolean,
}>

export type {
	GraphPath,
	VisitData,
	VisitFx,
	TraversalApproach,
	TraversalOptions,
	AdoptionOptions,
}
