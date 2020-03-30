import { Vector3 } from "@babylonjs/core";

export type Node = {
    id: number,
    fileName?: string,
    name: string
    healthPercent: number
    dependsOn: DirectionalNodeDependency[],
    dependenceFor: DirectionalNodeDependency[]
};

export type DirectionalNodeDependency = {
    id: number,
    nodeId: number,
    nodeName: string,
    description: string
};

export type NodeDependencyDb = {
    id: number,
    fromNodeId: number,
    toNodeId: number,
    description: string
}

export type Graph = {
    version: number,
    nodes: GraphNode[],
    connections: GraphConnections[]
}

export type GraphConnections = {
    id: number,
    points: Vector3[],
    curvePoints?: Vector3[],
    lastTangent?: Vector3,
    yRotation: number | undefined
}

export type GraphNode = {
    nodeId: number,
    fileName?: string,
    name: string,
    node: Node,
    position: Vector3
}