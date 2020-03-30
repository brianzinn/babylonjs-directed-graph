import { select, put, takeEvery, all } from 'redux-saga/effects'
import {
  ADD_NODE, ADD_NODE_SUCCESS, ADD_NODE_ERROR,
  ADD_NODE_DEPENDENCY, ADD_NODE_DEPENDENCY_ERROR, ADD_NODE_DEPENDENCY_SUCCESS,
  REMOVE_NODE_DEPENDENCY, REMOVE_NODE_DEPENDENCY_SUCCESS, REMOVE_NODE_DEPENDENCY_ERROR
} from './actionTypes'

import { Node, NodeDependencyDb } from '../types'

let nextNodeId = 99; // since we are not using a database

function* createNode(action: any) {
    console.log('adding NODE:', action.payload.name)
    
    try {
        // const response: any = yield call(apiAddNode, action.payload.name);
        // const newNode = response?.data?.node;
        const newNode = {
            id: nextNodeId++,
            name: action.payload.name,
            dependsOn: [],
            dependenceFor: [],
            healthPercent: 100
        } as Node;
        yield put({type: ADD_NODE_SUCCESS, payload: newNode})
    } catch (e) {
        yield put({type: ADD_NODE_ERROR, message: e.message})
    }
}

function* removeNodeDependency(action: any) {
  try {
    const { fromNodeId, toNodeId } = action.payload;

    // const response = yield call(apiDeleteDependency, fromNodeId, toNodeId);
    // if (response.statusText === 'OK') {
    // const deletedNodeDependency = getDeletedDependencyResponse?.data?.nodeDependencies[0];
    const { nodesData } = yield select();
    const nodeDependency = nodesData.nodesDependencies.find((n: NodeDependencyDb) => n.fromNodeId === fromNodeId && n.toNodeId === toNodeId);
    
    if (nodeDependency !== undefined) {
      yield put({type: REMOVE_NODE_DEPENDENCY_SUCCESS, payload: { nodeDependency }})
    } else {
      yield put({type: REMOVE_NODE_DEPENDENCY_ERROR, message: `cannot find: ${JSON.stringify(action.payload)}`})
    }
  } catch (e) {
      yield put({type: REMOVE_NODE_DEPENDENCY_ERROR, message: e.message})
  }
}

let nextNodeDependencyId = 99; // hack without a backing API

function* createNodeDependency(action: any) {
  try {
      const { fromNodeId, toNodeId } = action.payload;
      // const response: any = yield call(apiAddNodeDependency, fromNodeId, toNodeId );
      // const newNodeDependency = response?.data?.nodeDependency;
      const newNodeDependency = {
          id: nextNodeDependencyId++,
          fromNodeId: fromNodeId,
          toNodeId: toNodeId,
          description: ''
      } as NodeDependencyDb;
      yield put({type: ADD_NODE_DEPENDENCY_SUCCESS, payload: newNodeDependency})
  } catch (e) {
      yield put({type: ADD_NODE_DEPENDENCY_ERROR, message: e.message})
  }
}

// // worker Saga: will be fired on GET_NODES actions
// function* fetchNodes() {
//     try {
//         const nodesResponse = yield call(getNodes);
//         // TODO: this needs to do multiple pages (as a saga to get all nodes)
//         yield put({type: GET_NODES_SUCCESS, NODEs: nodesResponse?.data?.nodes.map((node: any): node => ({
//             id: node.id,
//             name: node.name,
//             healthPercent: 100,
//             dependsOn: [],
//             dependenceFor: []
//         }))});

//         const nodesDependenciesResponse = yield call(getNodesDependencies);
//         const { nodeDependencies, metadata } = nodesDependenciesResponse?.data;
//         if (metadata.totalPages > 1) {
//           console.error('need to add paging...')
//         }

//         const nodesDependencies = nodeDependencies.map((nodeDependency: any) => ({
//           id: nodeDependency.id,
//           fromNodeId: nodeDependency.fromNodeId,
//           toNodeId: nodeDependency.toNodeId,
//           description: nodeDependency.description
//         }))

//         yield put({type: GET_NODES_DEPENDENCIES_SUCCESS, nodesDependencies })
        
//    } catch (e) {
//       yield put({type: GET_NODES_ERROR, message: e.message});
//    }
// }

/*
  Starts getNodes on each dispatched `GET_NODES` action.
  Allows concurrent fetches of NODEs.
*/
function* mySaga() {
  yield all([
    // takeEvery(GET_NODES, fetchNODEs),
    takeEvery(ADD_NODE, createNode),
    takeEvery(ADD_NODE_DEPENDENCY, createNodeDependency),
    takeEvery(REMOVE_NODE_DEPENDENCY, removeNodeDependency)
  ])
}

export default mySaga;