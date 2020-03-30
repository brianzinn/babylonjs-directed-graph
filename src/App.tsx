import React from 'react';
import { connect } from 'react-redux'
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Control } from '@babylonjs/gui/2D/controls/control'
import { Scene, Engine } from 'react-babylonjs'

import AddNode from './components/AddNode';
import NodeButton from './components/NodeButton';
import NodeDependencies from './components/NodeDependencies';
import HealthSelector from './components/HealthSelector'
import { getNodes, selectNode, addNode, addNodeDependency, removeNodeDependency, updateNodeHealthPercent } from './redux/actions';
import { Node, GraphNode, Graph, GraphConnections } from './types';
import './App.css';

const mapStateToProps = (state: any /*, ownProps*/) => {
  const { nodesData } = state;
  const props = {
    nodes: nodesData.nodes,
    selectedNodeId: nodesData.selectedNodeId,
    selectedNode: nodesData.nodes.find((node: Node) => node.id === nodesData.selectedNodeId),
    selectedNodeGraph: nodesData.selectedNodeGraph
  }

  return props;
}

type DispatchProps = {
  getNodes: () => void;
  selectNode: (id: number) => void;
  addNode: (name: string) => void;
  addNodeDependency: (fromNodeId: number, toNodeId: number) => void;
  removeNodeDependency: (fromNodeId: number, toNodeId: number) => void;
  updateNodeHealthPercent: (nodeId: number, healthPercent: number) => void;
}

type MapProps = {
  nodes: Node[];
  selectedNodeId?: number;
  selectedNode?: Node;
  selectedNodeGraph?: Graph;
}

const mapDispatchToProps = { getNodes, selectNode, addNode, addNodeDependency, removeNodeDependency, updateNodeHealthPercent }

type ComponentProps = DispatchProps & MapProps

//Array of paths to construct extrusion
const width = 0.025;
const height = 0.025;
const arrowShape = [
  new Vector3(width/2, height/-2, 0),
  new Vector3(width/2, height/2, 0),
  new Vector3(width/-2, height/2, 0),
  new Vector3(width/-2, height/-2, 0) 
];

const arrowColor = Color3.White();

const progressHorizontalMargin: number = 0.02;
const progressVerticalMargin: number = 0.1;

arrowShape.push(arrowShape[0]);

const App: React.FC<ComponentProps> = ({ getNodes, selectNode, addNode, addNodeDependency, removeNodeDependency, updateNodeHealthPercent, nodes, selectedNodeId, selectedNode, selectedNodeGraph }: ComponentProps) => {

  // useEffect(() => {
  //   // to load cities from remote site...
  //   // getNodes()
  // }, []);

  return (
    <Grid container spacing={0}>
      <Grid key='header' item xs={12}>
        <AddNode addNode={addNode} />
      </Grid>
      <Grid key='buttons' item xs={12}>
        <Box
          display="flex"
          flexWrap="wrap"
          p={1}
          m={1}
          bgcolor="background.paper"
        >
        {
        nodes.map((node: any) => (
          <Box p={1} key={`button=${node.id}`}>
            <NodeButton node={node} setNode={selectNode} selected={node.id === selectedNodeId} />
          </Box>
        ))
        }
        </Box>
      </Grid>
      <Grid key='application' container item xs={12} spacing={3}>
        <Grid key='canvas' item xs={12} sm={6}>
          <Engine antialias={true} adaptToDeviceRatio={true} canvasId="sample-canvas">
            <Scene>
              <arcRotateCamera name="arc" target={ new Vector3(0, 1, 0) }
                    alpha={-Math.PI / 2} beta={Math.PI / 4}
                    radius={8} minZ={0.001} wheelPrecision={50} 
                    lowerRadiusLimit={0.1} upperRadiusLimit={20} upperBetaLimit={Math.PI / 2} />
              <hemisphericLight name='hemi' direction={new Vector3(0, -1, 0)} intensity={0.6} />
              <directionalLight name="shadow-light" setDirectionToTarget={[Vector3.Zero()]} direction={Vector3.Zero()} position = {new Vector3(-40, 30, -40)}
                intensity={0.05} shadowMinZ={1} shadowMaxZ={2500}>
                <shadowGenerator mapSize={1024} useBlurExponentialShadowMap={false} blurKernel={32} darkness={0.6}
                  shadowCastersExcluding={['ground', 'gazeTracker', 'BackgroundHelper', 'BackgroundPlane', 'BackgroundSkybox']} forceBackFacesOnly={true} depthScale={100} />
              </directionalLight>
              {selectedNodeGraph && selectedNodeGraph.nodes.map((s: GraphNode) =>
                  <React.Fragment key={`graph-node-${s.nodeId}`}>
                    {(s.node?.fileName === undefined) &&
                      <box name={`box-${s.nodeId}`} key={`box-${s.nodeId}`} height={0.25} width={1} depth={1} position={s.position}>
                        <standardMaterial name={`mat-${s.nodeId}`} diffuseColor={s.nodeId === selectedNodeId ? Color3.Red() : Color3.Blue()} specularColor={Color3.Black()} />
                      </box>
                    }
                    {(s.node?.fileName !== undefined) &&
                      <model
                        key={`model-${s.nodeId}`}
                        rootUrl={process.env.PUBLIC_URL + '/assets/quaternius_buildings/'}
                        sceneFilename={s.node?.fileName}
                        scaleToDimension={1}
                        position={s.position}
                        rotation={new Vector3(0, Math.PI, 0)}
                      />
                    }
                    <plane key={`plane-${s.nodeId}`} name="dialog" size={2} position={s.position.add(new Vector3(0, 1.25, 0))}>
                      <advancedDynamicTexture name="dialogTexture" height={1024} width={1024}
                        createForParentMesh={true}
                        hasAlpha={true}
                        generateMipMaps={true}
                        samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
                      >
                        <rectangle name="rect-1" height={0.25} width={1} thickness={12} cornerRadius={24} background='#666666'>
                            <rectangle height={0.7} verticalAlignment={Control.VERTICAL_ALIGNMENT_TOP}>
                              <textBlock text={s.name} fontFamily="FontAwesome" fontStyle="bold" fontSize={200} color="white" />
                            </rectangle>
                            <rectangle name="background-rectangle" width={1} height={0.3} background={'#596877'} cornerRadius={10} thickness={4} verticalAlignment={Control.VERTICAL_ALIGNMENT_BOTTOM} >
                              <container name="progress-container" horizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} width={1-progressHorizontalMargin} left={`${progressHorizontalMargin/2 * 100}%`} height={`${(1-progressVerticalMargin*2) * 100}%`} >
                                <rectangle name="progress-rectangle" horizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} background={(s.node!.healthPercent > 75) ? '#7BC14E' : '#FF0000'} cornerRadius={10} thickness={4} width={s.node!.healthPercent / 100}></rectangle>
                              </container>
                              <textBlock
                                text={`${s.node?.healthPercent}%`}
                                fontSize={48} fontFamily={'Arial'}
                                color={(s.node?.healthPercent > 50) ? 'black' : 'white' /* temp hack */}
                                verticalAlignment={Control.VERTICAL_ALIGNMENT_CENTER}
                                horizontalAlignment={Control.HORIZONTAL_ALIGNMENT_CENTER}
                              />
                            </rectangle>
                        </rectangle>
                      </advancedDynamicTexture>
                    </plane>
                  </React.Fragment>
                )
              }
              {selectedNodeGraph && selectedNodeGraph.connections.map((c: GraphConnections) =>
                <React.Fragment key={`graph-connnection-${selectedNodeGraph.version}-${c.id}`}>
                  <extrudeShape key={`arrow-${selectedNodeGraph.version}-${c.id}`} name={`l${selectedNodeGraph.version}-${c.id}`} path={c.curvePoints} shape={arrowShape} sideOrientation={ Mesh.DOUBLESIDE } cap={ Mesh.CAP_ALL }>
                    <standardMaterial key={`arrow-mat-${selectedNodeGraph.version}-${c.id}`} name={`sm${selectedNodeGraph.version}-${c.id}`} diffuseColor={arrowColor} specularColor={Color3.Black()} />
                  </extrudeShape>
                  {(c.curvePoints !== undefined && c.lastTangent !== undefined) &&
                    <cylinder key={`arrow-head-${selectedNodeGraph.version}-${c.id}`} name={`c${selectedNodeGraph.version}-${c.id}`} tessellation={3} height={0.025} diameter={0.25} position={c.curvePoints[c.curvePoints?.length - 1]} rotation={new Vector3(0, c.yRotation || 0, 0)}>
                      <standardMaterial key={`arrow-head-mat-${selectedNodeGraph.version}-${c.id}`} name={`c${selectedNodeGraph.version}-${c.id}`} diffuseColor={arrowColor} specularColor={Color3.Black()} />
                    </cylinder>
                  }
                </React.Fragment>
              )}

              {selectedNodeGraph === undefined &&
                <plane name="dialog" size={2} position={new Vector3(0, 1.5, 0)}>
                  <advancedDynamicTexture name="dialogTexture" height={1024} width={1024} createForParentMesh={true} hasAlpha={true}>
                    <rectangle name="rect-1" height={0.5} width={1} thickness={12} cornerRadius={12}>
                        <rectangle>
                          <textBlock text={selectedNode ? selectedNode.name : 'select a\nbuilding'} fontFamily="FontAwesome" fontStyle="bold" fontSize={200} color="white" />
                        </rectangle>
                    </rectangle>
                  </advancedDynamicTexture>
                </plane>
              }
              <environmentHelper options={{ enableGroundShadow: true /* true by default */, groundYBias: 1 }} setMainColor={[Color3.FromHexString('#74b9ff')]} />
              <vrExperienceHelper webVROptions={{ createDeviceOrientationCamera: false }} enableInteractions={true} />
            </Scene>
          </Engine>
        </Grid>
        {selectedNode &&
          <Grid key='form' item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Building:
            </Typography>
            <strong>{selectedNode.name}</strong>
            <Typography variant="subtitle1" gutterBottom>
              Directly connected buildings:
            </Typography>
            <NodeDependencies
              key={`node-deps-${selectedNode.id}`}
              nodes={nodes}
              selectedNode={selectedNode}
              addNodeDependency={addNodeDependency}
              removeNodeDependency={removeNodeDependency}
            />
            <Typography variant="subtitle1" gutterBottom>
              Building Health %:
            </Typography>
            <HealthSelector key={selectedNode.id} nodeId={selectedNode.id} nodeHealthPercent={selectedNode.healthPercent} updateNodeHealthPercent={updateNodeHealthPercent} />
          </Grid>
        }
      </Grid>
    </Grid>
  )
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);