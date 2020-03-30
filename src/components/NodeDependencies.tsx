import React, { useState, useRef } from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { Node } from '../types'

type NodeDependenciesProps = {
    nodes: Node[],
    selectedNode: Node,
    addNodeDependency: (fromNodeId: number, toNodeId: number) => void,
    removeNodeDependency: (fromNodeId: number, toNodeId: number) => void
};

const useStyles = makeStyles((theme) => ({
    root: {
        width: 500,
        '& > * + *': {
            marginTop: theme.spacing(3),
        },
    },
}));

const NodeDependencies = ({ nodes, selectedNode, addNodeDependency, removeNodeDependency }: NodeDependenciesProps) => {
    const classes = useStyles();

    const defaultNodeIds = selectedNode.dependsOn.map(d => d.nodeId);

    const defaultNodes = useRef<Node[] | null>(null); // to avoid material UI controlled messages
    if (defaultNodes.current === null) {
        defaultNodes.current = nodes.filter(s => defaultNodeIds.includes(s.id));
    }

    const [selectedNodes, setSelectedNodes] = useState<Node[]>(defaultNodes.current);

    // fn is not memoized
    const onDependenciesChange = (_: object, updatedNodes: any, reason: string) => {
        updatedNodes = (updatedNodes === null ? [] : updatedNodes) as Node[];

        const previouslySelectedIds: number[] = selectedNodes.map(n => n.id);
        const newNodes: Node[] = updatedNodes.filter((n: Node) => !previouslySelectedIds.includes(n.id))
        if (newNodes.length) {
            newNodes.forEach(n => addNodeDependency(selectedNode.id, n.id))
            // console.log('new nodes added:', newNodes);
        } else {
            const latestIds: number[] = updatedNodes.map((n: Node) => n.id);
            const removedNodes = selectedNodes.filter((n: Node) => !latestIds.includes(n.id));
            // console.log('removed nodes:', removedNodes);
            removedNodes.forEach(n => removeNodeDependency(selectedNode.id, n.id))
        }
        // switch (reason) {
        //     case 'select-option':
        //         items.forEach((item: any) => addNodeDependency(selectedNode.id, item.value))
        //         break;
        //     case 'remove-option':
        //         console.log('removing', _, items);
        //         items.forEach((item: any) => removeNodeDependency(selectedNode.id, item.value))
        //         break;
        //     default:
        //         console.error("unsupported reason (freeSolo not enabled)", reason, items);
        //         break;
        // }
        setSelectedNodes(updatedNodes);
    };

    return <div className={classes.root}>
        <Autocomplete
            multiple
            id="buildings-standard"
            options={nodes}
            getOptionLabel={(option: Node) => option.name}
            defaultValue={defaultNodes.current}
            getOptionSelected={(option, value) => value.id === option.id}
            onChange={onDependenciesChange}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    variant="standard"
                    label="Directly Connected To"
                    placeholder="buildings"
                />
            )}
        />
    </div>
}
export default NodeDependencies