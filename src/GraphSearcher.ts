import Queue from './queue';
import { Node } from './types';

export default class GraphSearcher<T extends Node> {
    BFS = (node: T, nodes: T[], includeOutEdges: boolean = false): T[] => {
        const queue = new Queue<T>();
        const explored = new Set<number>();
        queue.enqueue(node);
        explored.add(node.id);
        while (!queue.isEmpty()) {
            const item: T = queue.dequeue()!;
            // console.log('dequeued:', item.constructor);

            item.dependsOn.filter(dnd => !explored.has(dnd.nodeId)).forEach(dnd => {
                const nodeMatch: T | undefined = nodes.find(s => s.id === dnd.nodeId);
                if (nodeMatch === undefined) {
                    console.error("Cannot find node for dnd (directional node dependency):", dnd);
                } else {
                    explored.add(nodeMatch.id);
                    queue.enqueue(nodeMatch);
                }
           });

            if (includeOutEdges === true) {
                item.dependenceFor.filter(dnd => !explored.has(dnd.nodeId)).forEach(dnd => {
                    const nodeMatch: T | undefined = nodes.find(n => n.id === dnd.nodeId);
                    if (nodeMatch === undefined) {
                        console.error("Cannot find node for dnd (Directional Node Dependency):", dnd);
                    } else {
                        explored.add(nodeMatch.id);
                        queue.enqueue(nodeMatch);
                    }
                });
           }
        }

        return nodes.filter(n => explored.has(n.id));
     }
}