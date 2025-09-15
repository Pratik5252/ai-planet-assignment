import { Position } from '@xyflow/react';
import { MessageSquare, Database, Bot, Monitor } from 'lucide-react';
import type { WorkflowNodeConfig } from '../types/workflow-nodes';

export const userQueryConfig: WorkflowNodeConfig = {
    id: 'user-query',
    title: 'User Query',
    icon: MessageSquare,
    description: 'Entry point for user queries',
    color: '#1976D2',
    bgColor: '#E3F2FD',
    width: 'w-64',
    handles: [
        {
            id: 'query-output',
            type: 'source',
            position: Position.Right,
            label: 'Query',
            style: { background: '#2196F3' },
        },
    ],
    fields: [
        {
            id: 'query',
            label: 'User Query',
            type: 'textarea',
            placeholder: 'Write your query here...',
            required: true,
        },
    ],
};

export const knowledgeBaseConfig: WorkflowNodeConfig = {
    id: 'knowledge-base',
    title: 'Knowledge Base',
    icon: Database,
    description: 'Let LLM search info to your file',
    color: '#388E3C',
    bgColor: '#E8F5E8',
    width: 'w-64',
    handles: [
        {
            id: 'query-input',
            type: 'target',
            position: Position.Left,
            label: 'Query',
            style: { background: '#4CAF50' },
        },
        {
            id: 'context-output',
            type: 'source',
            position: Position.Right,
            label: 'Context',
            style: { background: '#4CAF50' },
        },
    ],
    fields: [
        {
            id: 'upload-file',
            label: 'File for Knowledge Base',
            type: 'file',
            placeholder: 'Upload File',
        },
        {
            id: 'embedding-model',
            label: 'Embedding Model',
            type: 'select',
            options: [
                {
                    label: 'text-embedding-3-large',
                    value: 'text-embedding-3-large',
                },
                {
                    label: 'text-embedding-3-small',
                    value: 'text-embedding-3-small',
                },
                { label: 'ada-002', value: 'ada-002' },
            ],
            defaultValue: 'text-embedding-3-large',
        },
        {
            id: 'api-key',
            label: 'API Key',
            type: 'input',
            placeholder: '**********************',
        },
        {
            id: 'query-text',
            label: 'Query',
            type: 'textarea',
            placeholder: 'Enter query...',
        },
    ],
};

export const llmEngineConfig: WorkflowNodeConfig = {
    id: 'llm-engine',
    title: 'LLM (OpenAI)',
    icon: Bot,
    description: 'Run a query with OpenAI LLM',
    color: '#7B1FA2',
    bgColor: '#F3E5F5',
    width: 'w-80',
    handles: [
        {
            id: 'query-input',
            type: 'target',
            position: Position.Left,
            label: 'Query',
            style: { background: '#9C27B0' },
        },
        {
            id: 'context-input',
            type: 'target',
            position: Position.Left,
            label: 'Context',
            style: { background: '#9C27B0' },
        },
        {
            id: 'response-output',
            type: 'source',
            position: Position.Right,
            label: 'Output',
            style: { background: '#9C27B0' },
        },
    ],
    fields: [
        {
            id: 'model',
            label: 'Model',
            type: 'select',
            options: [
                { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
                { label: 'GPT-4', value: 'gpt-4' },
                { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
            ],
            defaultValue: 'gpt-4o-mini',
        },
        {
            id: 'api-key',
            label: 'API Key',
            type: 'input',
            placeholder: '**********************',
        },
        {
            id: 'prompt',
            label: 'Prompt',
            type: 'textarea',
            placeholder:
                'You are a helpful PDF assistant. Use CONTEXT (content) and USER Query (query) to answer user questions.',
            defaultValue:
                'You are a helpful PDF assistant. Use CONTEXT (content) and USER Query (query) to answer user questions.',
        },
        {
            id: 'temperature',
            label: 'Temperature',
            type: 'number',
            placeholder: '0.7',
            defaultValue: 0.7,
            min: 0,
            max: 2,
            step: 0.1,
        },
        {
            id: 'web-search',
            label: 'WebSearch Tool',
            type: 'toggle',
            defaultValue: false,
        },
        {
            id: 'serp-api-key',
            label: 'SERP API',
            type: 'input',
            placeholder: '**********************',
        },
    ],
};

export const outputConfig: WorkflowNodeConfig = {
    id: 'output',
    title: 'Output',
    icon: Monitor,
    description: 'Display the final results as text',
    color: '#F57C00',
    bgColor: '#FFF3E0',

    handles: [
        {
            id: 'output-input',
            type: 'target',
            position: Position.Left,
            label: 'Output',
            style: { background: '#FF9800' },
        },
    ],
    fields: [
        {
            id: 'output-text',
            label: 'Output Text',
            type: 'textarea',
            placeholder: 'Output will be generated when you run the workflow',
            defaultValue: '',
        },
    ],
};
