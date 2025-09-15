import { Position } from '@xyflow/react';
import { type LucideIcon } from 'lucide-react';

export interface NodeHandle {
    id: string;
    type: 'source' | 'target';
    position: Position;
    label?: string;
    style?: React.CSSProperties;
}

export interface NodeField {
    id: string;
    label: string;
    type:
        | 'textarea'
        | 'input'
        | 'select'
        | 'file'
        | 'toggle'
        | 'slider'
        | 'number';
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
    defaultValue?: string | number | boolean;
    className?: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
}

export interface WorkflowNodeConfig {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
    color?: string;
    bgColor?: string;
    handles: NodeHandle[];
    fields: NodeField[];
    width?: string;
}

export type NodeType = 'userQuery' | 'knowledgeBase' | 'llmEngine' | 'output';

export interface WorkflowNodeData {
    nodeType: NodeType;
    config: WorkflowNodeConfig;
    values: Record<string, string | number | boolean>;
}
