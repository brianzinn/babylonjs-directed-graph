import dagre, { Node as DagreNode } from 'dagre';
import { Vector3, Curve3, Path3D } from '@babylonjs/core/Maths'

import GraphSearcher from '../../GraphSearcher'
import { Graph, Node, GraphNode, GraphConnections, DirectionalNodeDependency } from '../../types'

let version = 1;

/**
 * 
 * @param targetMeshPosition
 * @param lAt 
 */
const getRotationY = (targetMeshPosition: Vector3, vectorDirection: Vector3): number => {
	/*
	 * tM = mesh to rotate.
	 * lAt = vector3(xyz) of target position to look at
	 */
	 
	const diff = vectorDirection.subtract(targetMeshPosition);
    // return -Math.atan2(diff.z, diff.x) - (3 * (Math.PI / 4));
    return  -Math.atan2(diff.z, diff.x)
}

const getNodeGraph = (selectedNodeId: number | undefined, nodes: Node[]): Graph | undefined => {
    version++;
    const matchingNode = nodes.find(s => s.id === selectedNodeId);
    if (matchingNode === undefined) {
        console.error('no matching node found.', selectedNodeId)
        return undefined;
    }

    let selectedNodeGraph: Graph = {
        nodes: [],
        connections: [],
        version
    };

    const includeOutEdges = true; // makes the graph larger and connect nodes that connect to this one
    const connectedNodes: Node[] = new GraphSearcher<Node>().BFS(matchingNode!, nodes, includeOutEdges);
    // console.log("Nodes from selected:", connectedNodes.map(s => s.name).join(','));
    var g = new dagre.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(function () { return {}; });
    connectedNodes.forEach(s => {
        // using 100 pixels, while our objects are 1 meter in 3d space (guesstimate)
        g.setNode(s.id.toString(), { label: s.name, width: 100, height: 100, nodeId: s.id });
    });

    // used to lookup edge - needed to connected to ID to make unique to render (key)
    type dsdLookup = {
        sourceId: string,
        targetId: string,
        dsdId: number
    }
    const allDsds: dsdLookup[] = [];

    connectedNodes.forEach(n => {
        n.dependsOn.forEach((dnd: DirectionalNodeDependency) => {
            allDsds.push({
                sourceId: n.id.toString(),
                targetId: dnd.nodeId.toString(),
                dsdId: dnd.id
            });
            g.setEdge(n.id.toString(), dnd.nodeId.toString());
        });
    });
    dagre.layout(g);
    const allNodes: DagreNode[] = [];
    g.nodes().forEach(function (v) {
        allNodes.push(g.node(v));
    });
    /* we are converting pixels to meters */
    // TODO: gosh, may as well do this in one loop now...
    const DIVISOR = 50;
    const lowestX = allNodes.reduce((accumulator, currentValue) => Math.min(accumulator, currentValue.x), 9999) / DIVISOR;
    const highestX = allNodes.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue.x), 0) / DIVISOR;
    const lowestY = allNodes.reduce((accumulator, currentValue) => Math.min(accumulator, currentValue.y), 9999) / DIVISOR;
    const highestY = allNodes.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue.y), 0) / DIVISOR;
    const xTranslation = (highestX - lowestX) / 2;
    const zTranslation = (highestY - lowestY) / 2;
    // y-up (right handed system)
    const translationVector = new Vector3(xTranslation, 0, zTranslation);
    const scaleVector = new Vector3(1 / DIVISOR, 0, 1 / DIVISOR);

    const HEIGHT_ABOVE_GROUND: number = 1.0;

    allNodes.forEach(node => {
        selectedNodeGraph.nodes.push({
            nodeId: (node as any).nodeId,
            name: (node as any).label,
            node: nodes.find(n => n.id === (node as any).nodeId), 
            position: new Vector3(node.x, HEIGHT_ABOVE_GROUND, node.y).multiplyInPlace(scaleVector).subtractInPlace(translationVector),
            x: (node.x / DIVISOR) - xTranslation,
            y: (node.y / DIVISOR) - zTranslation
        } as GraphNode);
    });
    g.edges().forEach(e => {
        const matchingDsd = allDsds.find(dnd => dnd.sourceId === e.v && dnd.targetId === e.w);
        if (matchingDsd === undefined) {
            console.error('cannot find DND for edge:', e);
        }

        const edge = g.edge(e);
        const edgePointsIn3dSpace: Vector3[] = edge.points.map(e => new Vector3(e.x, 0, e.y).multiplyInPlace(scaleVector).subtractInPlace(translationVector));
        let curve: Curve3 | undefined = undefined;
        if (edgePointsIn3dSpace.length < 3) {
            console.error(`found ${edgePointsIn3dSpace.length} < 3 control points on edge:`, matchingDsd);
        } else {
            const origin = edgePointsIn3dSpace[0];
            const control1 = edgePointsIn3dSpace[1];
            const destination = edgePointsIn3dSpace[edgePointsIn3dSpace.length - 1]

            switch (edgePointsIn3dSpace.length) {
                case 3:
                    curve = Curve3.CreateQuadraticBezier(origin, control1, destination, 50);
                    break;
                case 4:
                    curve = Curve3.CreateCubicBezier(origin, control1, edgePointsIn3dSpace[2], destination, 80);
                    break;
                default:
                    curve = Curve3.CreateCatmullRomSpline(edgePointsIn3dSpace, edgePointsIn3dSpace.length * 25, false);
                    break;
            }
        }

        const curvePoints = curve !== undefined ? curve.getPoints() : [];
        let lastTangent: Vector3 | undefined = undefined;
        let yRotation: number | undefined = undefined;

        if (curvePoints.length > 0) {
            const path = new Path3D(curvePoints);
            const tangents: Vector3[] = path.getTangents();
            lastTangent = tangents[tangents.length - 1];
            // const lastPoint = curvePoints[curvePoints.length - 1];
            // yRotation = -Math.atan2(lastTangent.z, lastTangent.x) + Math.PI / 6;

            const lookingAt = curvePoints[curvePoints.length - 1].add(lastTangent);
            yRotation = getRotationY(curvePoints[curvePoints.length - 1], lookingAt);
            // console.log(`from ${matchingDsd?.sourceId} to ${matchingDsd?.targetId} => ${yRotation} =? ${yRotation * 180/Math.PI}`)
        }

        const edgePoints: GraphConnections ={
            id: matchingDsd!.dsdId,
            points: edgePointsIn3dSpace,
            curvePoints,
            lastTangent,
            yRotation
        };
        
        selectedNodeGraph.connections.push(edgePoints);
    });

    return selectedNodeGraph;
}

export default getNodeGraph;