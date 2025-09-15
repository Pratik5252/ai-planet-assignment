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
import { useCallback, useEffect, useRef } from 'react';
import {
    UserQueryNode,
    KnowledgeBaseNode,
    LLMEngineNode,
    OutputNode,
} from './components/WorkflowNodes';
import CustomEdge from './CustomEdge';
import { SidebarTrigger } from './components/ui/sidebar';
import { useDnD } from './DnDContext';
import { useWorkflowPersistence } from './hooks/useWorkflowPersistence';

const nodeTypes = {
    userQuery: UserQueryNode,
    knowledgeBase: KnowledgeBaseNode,
    llmEngine: LLMEngineNode,
    output: OutputNode,
};
const edgeTypes = { customEdge: CustomEdge };

let id = 0;
const getId = () => `dndnode_${id++}`;

interface ReactFlowCanvasProps {
    workflowId?: number;
    initialNodes?: Node[];
    initialEdges?: Edge[];
}

function ReactFlowCanvas({
    workflowId,
    initialNodes = [],
    initialEdges = [],
}: ReactFlowCanvasProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const [type, setType] = useDnD();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const { saveNow, isSaving } = useWorkflowPersistence({
        workflowId: workflowId || 0,
        nodes,
        edges,
        enabled: !!workflowId,
    });

    useEffect(() => {
        if (initialNodes.length > 0 || initialEdges.length > 0) {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [initialNodes, initialEdges, setNodes, setEdges]);

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
                {workflowId && isSaving && (
                    <Panel position="top-right" className="m-2">
                        <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg shadow-md border text-sm flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Saving...
                        </div>
                    </Panel>
                )}
            </ReactFlow>
        </div>
    );
}

interface ReactFlowDemoProps {
    workflowId?: number;
    initialNodes?: Node[];
    initialEdges?: Edge[];
}

export default function ReactFlowDemo({
    workflowId,
    initialNodes,
    initialEdges,
}: ReactFlowDemoProps = {}) {
    return (
        <ReactFlowProvider>
            <ReactFlowCanvas
                workflowId={workflowId}
                initialNodes={initialNodes}
                initialEdges={initialEdges}
            />
        </ReactFlowProvider>
    );
}
