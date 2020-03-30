import {
  GET_NODES,
  ADD_NODE,
  SELECT_NODE,
  ADD_NODE_DEPENDENCY,
  REMOVE_NODE_DEPENDENCY,
  UPDATE_NODE_HEALTH
} from "./actionTypes";

export type Node = {
    name: string
}

export const getNodes = () => ({
    type: GET_NODES
})

export const addNode = (name: string) => ({
  type: ADD_NODE,
  payload: { name }
});

export const addNodeDependency = (fromNodeId: number, toNodeId: number) => ({
  type: ADD_NODE_DEPENDENCY,
  payload: { fromNodeId, toNodeId }
});

export const selectNode = (id: number) => ({
  type: SELECT_NODE,
  payload: { id }
});

export const removeNodeDependency = (fromNodeId: number, toNodeId: number) => ({
  type: REMOVE_NODE_DEPENDENCY,
  payload: { fromNodeId, toNodeId }
})

export const updateNodeHealthPercent = (nodeId: number, healthPercent: number) => ({
  type: UPDATE_NODE_HEALTH,
  payload: {
    nodeId,
    healthPercent
  }
})
