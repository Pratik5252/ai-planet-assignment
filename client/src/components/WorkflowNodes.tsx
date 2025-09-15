import { WorkflowNode } from '../components/WorkflowNode';
import {
    userQueryConfig,
    knowledgeBaseConfig,
    llmEngineConfig,
    outputConfig,
} from '../config/nodeConfigs';

interface NodeProps {
    data?: Record<string, string | number | boolean>;
    onDataChange?: (data: Record<string, string | number | boolean>) => void;
}

export function UserQueryNode({ data, onDataChange }: NodeProps) {
    return (
        <WorkflowNode
            config={userQueryConfig}
            data={data}
            onDataChange={onDataChange}
            className="hover:ring-blue-300"
        />
    );
}

export function KnowledgeBaseNode({ data, onDataChange }: NodeProps) {
    return (
        <WorkflowNode
            config={knowledgeBaseConfig}
            data={data}
            onDataChange={onDataChange}
            className="hover:ring-green-300"
        />
    );
}

export function LLMEngineNode({ data, onDataChange }: NodeProps) {
    return (
        <WorkflowNode
            config={llmEngineConfig}
            data={data}
            onDataChange={onDataChange}
            className="hover:ring-purple-300"
        />
    );
}

export function OutputNode({ data, onDataChange }: NodeProps) {
    return (
        <WorkflowNode
            config={outputConfig}
            data={data}
            onDataChange={onDataChange}
            className="hover:ring-orange-300"
        />
    );
}
