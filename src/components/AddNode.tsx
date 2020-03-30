import React , { Component } from 'react'

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

type ComponentProps = {
    addNode: (name: string) => void;
}

type ComponentState = {
    newNodeName: string
  }

export default class AddNode extends Component<ComponentProps, ComponentState> {

    constructor(props: ComponentProps ) {
        super(props)
        this.state = {
          newNodeName: ''
        }
    }
    

    onNodeNameChange = (evt: any) => {
        const newNodeName = evt.target.value
        this.setState((state) => ({
          ...state,
          newNodeName
        }))
    }

    addButtonClicked = () => {
        this.props.addNode(this.state.newNodeName);
        // assumes success :)
        this.setState(state => ({
            ...state,
            newNodeName: ''
        }))
    }

    render() {
        return (
            <Box display="flex" justifyContent="flex-end" m={1} p={1} bgcolor="background.paper">
                <TextField id="standard-basic" label="new building name" value={this.state.newNodeName} onChange={this.onNodeNameChange} />
                <Button disabled={this.state.newNodeName.length <= 3} onClick={this.addButtonClicked}>add</Button>
            </Box>        
        )
    }
}