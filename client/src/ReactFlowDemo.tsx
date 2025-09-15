import {
    ReactFlow,
    Background,
    Controls,
    addEdge,
    type Node,
    type Edge,
    type OnConnect,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useRef } from 'react';
import {
    UserQueryNode,
    KnowledgeBaseNode,
    LLMEngineNode,
    OutputNode,
} from './components/WorkflowNodes';
import CustomEdge from './CustomEdge';
import { SidebarTrigger } from './components/ui/sidebar';
import { useDnD } from './DnDContext';

const nodeTypes = {
    userQuery: UserQueryNode,
    knowledgeBase: KnowledgeBaseNode,
    llmEngine: LLMEngineNode,
    output: OutputNode,
};
const edgeTypes = { customEdge: CustomEdge };

let id = 0;
const getId = () => `dndnode_${id++}`;

function ReactFlowCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { screenToFlowPosition } = useReactFlow();
    const [type, setType] = useDnD();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const onConnect: OnConnect = useCallback(
        (params) => setEdges((edgeSnapshot) => addEdge(params, edgeSnapshot)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!type) {
                console.log('No type set in context');
                return;
            }

            console.log('Dropping node of type:', type);

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: {},
            };

            console.log('Creating new node:', newNode);
            setNodes((nds) => [...nds, newNode]);
            setType(null);
        },
        [screenToFlowPosition, type, setType, setNodes]
    );

    return (
        <div style={{ height: '100%', width: '100vw' }} ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                }}
                snapToGrid={true}
                snapGrid={[20, 20]}
                style={{ width: '100%', height: '100%' }}
                className="bg-white"
            >
                <Background />
                <Controls position="bottom-center" orientation="horizontal" />
                <Panel position="top-left" className="m-2">
                    <SidebarTrigger
                        variant="outline"
                        className="bg-white shadow-md"
                    />
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default function ReactFlowDemo() {
    return (
        <ReactFlowProvider>
            <ReactFlowCanvas />
        </ReactFlowProvider>
    );
}
