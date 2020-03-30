import React, { Component, MouseEvent as ReactMouseEvent } from 'react'
import Button from '@material-ui/core/Button';

import { Node } from '../types'

type NodeButtonProps = {
    node: Node;
    setNode: (id: number) => void;
    selected: boolean;
}

export default class NodeButton extends Component<NodeButtonProps> {
    selectNode = (evt: ReactMouseEvent<HTMLButtonElement, MouseEvent>): void => {
        this.props.setNode(this.props.node.id);
    }
    
    render () {
        return (
            <Button onClick={this.selectNode} color={this.props.selected ? 'secondary' : undefined} style={{paddingRight: '5px'}}>
                <span>{this.props.node.name}</span>
            </Button>
        )
    }
}