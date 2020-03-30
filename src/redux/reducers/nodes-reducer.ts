import produce from 'immer'

import { GET_NODES_SUCCESS, SELECT_NODE, ADD_NODE_SUCCESS, GET_NODES_DEPENDENCIES_SUCCESS, ADD_NODE_DEPENDENCY_SUCCESS, REMOVE_NODE_DEPENDENCY_SUCCESS, UPDATE_NODE_HEALTH } from "../actionTypes";
import { Node, DirectionalNodeDependency, NodeDependencyDb, Graph } from '../../types'
import getNodeGraph from './graphSelector'

type NodeState = {
    nodes: Node[],
    nodesDependencies: NodeDependencyDb[],
    selectedNodeId?: number,
    selectedNodeGraph?: Graph
}

const removeNodeDependency = (nodeDependency: NodeDependencyDb, nodes: Node[]): void => {
    const fromNodeMatch = nodes.find(s => s.id === nodeDependency.fromNodeId);
    const toNodeMatch = nodes.find(s => s.id === nodeDependency.toNodeId);
    if (fromNodeMatch !== undefined && toNodeMatch !== undefined) {
        // console.log('filtering depends on:', fromNodeMatch, nodeDependency)
        fromNodeMatch.dependsOn = fromNodeMatch.dependsOn.filter(d => d.id !== nodeDependency.id);
    }
    else {
        console.warn("cannot find node dependant upon (delete):", nodeDependency);
    }
    if (toNodeMatch !== undefined && fromNodeMatch !== undefined) {
        toNodeMatch.dependenceFor = toNodeMatch.dependenceFor.filter(d => d.id !== nodeDependency.id);
    }
    else {
        console.warn("Cannot find node for dependancy (delete):", nodeDependency);
    }
}

const addNodeDependenciesToNodes = (nodesDependencies: NodeDependencyDb[], nodes: Node[]): void => {
    nodesDependencies.forEach((nodeDependency: NodeDependencyDb) => {
        // TODO: memoize this function for larger collections
        const fromNodeMatch = nodes.find(n => n.id === nodeDependency.fromNodeId);
        const toNodeMatch = nodes.find(n => n.id === nodeDependency.toNodeId);
        if (fromNodeMatch !== undefined && toNodeMatch !== undefined) {
            const directionalDependency: DirectionalNodeDependency = {
                id: nodeDependency.id,
                nodeId: toNodeMatch.id,
                nodeName: toNodeMatch.name,
                description: nodeDependency.description
            };
            // console.log("  > depends on adding:", fromNodeMatch, directionalDependency);
            fromNodeMatch.dependsOn.push(directionalDependency);
        }
        else {
            console.warn("cannot find node dependant upon:", nodeDependency);
        }
        if (toNodeMatch !== undefined && fromNodeMatch !== undefined) {
            const directionalDependency: DirectionalNodeDependency = {
                id: nodeDependency.id,
                nodeId: fromNodeMatch.id,
                nodeName: fromNodeMatch.name,
                description: nodeDependency.description
            };
            // console.log("  > dependency for:", toNodeMatch, directionalDependency);
            toNodeMatch.dependenceFor.push(directionalDependency);
        }
        else {
            console.warn("Cannot find node for dependancy:", nodeDependency);
        }
    });
}

const initialNodes: Node[] = [{
    name: 'Bank',
    fileName: 'Bank.obj',
    healthPercent: 100,
    id: 1,
    dependsOn: [{
        id: 1,
        nodeId: 2,
        nodeName: 'Flat',
        description: 'bank to flat'
    }],
    dependenceFor: []
}, {
    name: 'Flat',
    fileName: 'Flat.obj',
    healthPercent: 100,
    id: 2,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'Flat 2',
    fileName: 'Flat2.obj',
    healthPercent: 100,
    id: 3,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'Hospital',
    fileName: 'Hospital.obj',
    healthPercent: 100,
    id: 4,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'House',
    fileName: 'House.obj',
    healthPercent: 100,
    id: 5,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'House 2',
    fileName: 'House2.obj',
    healthPercent: 100,
    id: 6,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'House 3',
    fileName: 'House3.obj',
    healthPercent: 100,
    id: 7,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'House 4',
    fileName: 'House4.obj',
    healthPercent: 100,
    id: 8,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'House 5',
    fileName: 'House5.obj',
    healthPercent: 100,
    id: 9,
    dependsOn: [],
    dependenceFor: []
}, {
    name: 'Shop',
    fileName: 'Shop.obj',
    healthPercent: 100,
    id: 10,
    dependsOn: [],
    dependenceFor: []
}].sort((a, b) => a.name.localeCompare(b.name))

const initialState: NodeState = {
    nodes: initialNodes,
    nodesDependencies: [{
        id: 1,
        fromNodeId: 1,
        toNodeId: 2,
        description: 'bank to flat'
    }],
    selectedNodeId: 1,
    selectedNodeGraph: getNodeGraph(1, initialNodes)
};

const NodesData = produce(
    (draft: NodeState, action: any) => {
        switch (action.type) {
            case GET_NODES_SUCCESS: {
                draft.nodes = action.nodes.sort((a: Node, b: Node) => a.name.localeCompare(b.name))
                break;
            }
            case SELECT_NODE: {
                draft.selectedNodeId = action.payload.id;
                draft.selectedNodeGraph = getNodeGraph(draft.selectedNodeId, draft.nodes);
                break;
            }
            case ADD_NODE_SUCCESS: {
                draft.nodes = [
                    ...draft.nodes,
                    action.payload
                ].sort((a: Node, b: Node) => a.name.localeCompare(b.name))
                break;
            }
            case GET_NODES_DEPENDENCIES_SUCCESS: {
                const { nodesDependencies } = action;

                addNodeDependenciesToNodes(nodesDependencies, draft.nodes);
                draft.nodesDependencies = nodesDependencies
                break;
            }
            case ADD_NODE_DEPENDENCY_SUCCESS:
            {
                const { payload } = action;
                addNodeDependenciesToNodes([payload], draft.nodes);

                draft.selectedNodeGraph = getNodeGraph(draft.selectedNodeId, draft.nodes);
                draft.nodesDependencies.push(payload);
                break;
            }
            case REMOVE_NODE_DEPENDENCY_SUCCESS:
            {
                const { nodeDependency } = action.payload;
                removeNodeDependency(nodeDependency, draft.nodes);

                draft.selectedNodeGraph = getNodeGraph(draft.selectedNodeId, draft.nodes);
                draft.nodesDependencies = draft.nodesDependencies.filter((d: NodeDependencyDb) => d.id !== nodeDependency.id);
                break;
            }
            case UPDATE_NODE_HEALTH:
            {
                const { nodeId, healthPercent } = action.payload;
                const nodeMatch = draft.nodes.find(s => s.id === nodeId);
                if (nodeMatch === undefined) {
                    console.error('cannot update node health score (cannot find node)', nodeId);
                } else {
                    nodeMatch.healthPercent = healthPercent;
                    // hack for now
                    const graphMatch = draft.selectedNodeGraph?.nodes.find(n => n.nodeId === nodeId);
                    graphMatch!.node.healthPercent = healthPercent;
                }
                break;
            }
        }
    },
    initialState
)
;

export default NodesData;