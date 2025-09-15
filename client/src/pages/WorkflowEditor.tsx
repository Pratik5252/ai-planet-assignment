import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    MessageCircle,
    CheckCircle,
} from 'lucide-react';
import { useWorkflow, useUpdateWorkflow } from '../hooks/useWorkFlowAPI';
import ReactFlowDemo from '../ReactFlowDemo';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const WorkflowEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const workflowId = id ? parseInt(id, 10) : 0;

    const [workflowName, setWorkflowName] = useState('');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Execution states
    const [isValidating, setIsValidating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<
        {
            type: 'user' | 'ai' | 'error';
            message: string;
            timestamp: string;
            context_used?: boolean;
            execution_log?: string[];
        }[]
    >([]);

    const { data: workflow, isLoading, error } = useWorkflow(workflowId);
    const { mutate: updateWorkflow } = useUpdateWorkflow();

    useEffect(() => {
        if (workflow) {
            setWorkflowName(workflow.name);
            setWorkflowDescription(workflow.description || '');
        }
    }, [workflow]);

    const handleSaveMetadata = () => {
        if (!workflow) return;

        setIsSaving(true);
        updateWorkflow(
            {
                id: workflowId,
                data: {
                    name: workflowName.trim(),
                    description: workflowDescription.trim() || undefined,
                },
            },
            {
                onSuccess: () => {
                    setHasUnsavedChanges(false);
                    setIsSaving(false);
                },
                onError: (error) => {
                    console.error('Failed to save workflow:', error);
                    setIsSaving(false);
                },
            }
        );
    };

    const handleValidateWorkflow = async () => {
        setIsValidating(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/workflow-execution/${workflowId}/validate`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            const result = await response.json();

            if (result.valid) {
                alert('✅ Workflow is valid and ready to execute!');
            } else {
                alert(
                    `❌ Validation failed: ${
                        result.errors?.join(', ') || 'Unknown error'
                    }`
                );
            }
        } catch (error) {
            console.error('Validation failed:', error);
            alert('❌ Validation failed: ' + (error as Error).message);
        } finally {
            setIsValidating(false);
        }
    };

    const handleChatSubmit = async () => {
        if (!chatInput.trim()) return;

        setIsExecuting(true);
        const userMessage = chatInput.trim();
        setChatInput('');

        // Add user message to chat
        const newUserMessage = {
            type: 'user' as const,
            message: userMessage,
            timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, newUserMessage]);

        try {
            const response = await fetch(
                `http://localhost:8000/api/workflow-execution/${workflowId}/chat`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: userMessage }),
                }
            );

            const result = await response.json();

            // Add AI response to chat
            const aiMessage = {
                type: 'ai' as const,
                message: result.message || 'No response generated',
                timestamp: result.timestamp,
                context_used: result.context_used,
                execution_log: result.execution_log,
            };
            setChatHistory((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat failed:', error);
            const errorMessage = {
                type: 'error' as const,
                message:
                    'Failed to execute workflow: ' + (error as Error).message,
                timestamp: new Date().toISOString(),
            };
            setChatHistory((prev) => [...prev, errorMessage]);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleBack = () => {
        if (hasUnsavedChanges) {
            if (
                window.confirm(
                    'You have unsaved changes. Are you sure you want to leave?'
                )
            ) {
                navigate('/workflows');
            }
        } else {
            navigate('/workflows');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading workflow...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !workflow) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Workflow Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error?.message ||
                            'The workflow you are looking for does not exist.'}
                    </p>
                    <button
                        onClick={() => navigate('/workflows')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Workflows
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header - Fixed Full Width Navbar */}
            <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm border-b">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-1" />
                                Back
                            </button>

                            {/* <div className="flex flex-col">
                                <input
                                    type="text"
                                    value={workflowName}
                                    onChange={(e) =>
                                        handleNameChange(e.target.value)
                                    }
                                    className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                    placeholder="Workflow name"
                                />
                                <input
                                    type="text"
                                    value={workflowDescription}
                                    onChange={(e) =>
                                        handleDescriptionChange(e.target.value)
                                    }
                                    className="text-sm text-gray-600 bg-transparent border-none outline-none hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 mt-1"
                                    placeholder="Add description..."
                                />
                            </div> */}
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Execution Controls */}
                            <Button
                                variant="outline"
                                onClick={handleValidateWorkflow}
                                disabled={isValidating}
                                className="inline-flex items-center px-4 py-2 text-green-700 border-green-300 hover:bg-green-50"
                            >
                                {isValidating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Build Stack
                                    </>
                                )}
                            </Button>

                            <Dialog
                                open={isChatOpen}
                                onOpenChange={setIsChatOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Chat with Stack
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Chat with {workflow?.name}
                                        </DialogTitle>
                                    </DialogHeader>

                                    {/* Chat History */}
                                    <div className="flex-1 h-96 p-4 border rounded-lg bg-gray-50 overflow-y-auto">
                                        {chatHistory.length === 0 ? (
                                            <div className="text-center text-gray-500 mt-8">
                                                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p>
                                                    Start a conversation with
                                                    your workflow!
                                                </p>
                                                <p className="text-sm mt-2">
                                                    Ask questions or provide
                                                    inputs to execute the
                                                    workflow.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {chatHistory.map(
                                                    (entry, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex ${
                                                                entry.type ===
                                                                'user'
                                                                    ? 'justify-end'
                                                                    : 'justify-start'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-[80%] rounded-lg p-3 ${
                                                                    entry.type ===
                                                                    'user'
                                                                        ? 'bg-blue-600 text-white'
                                                                        : entry.type ===
                                                                          'error'
                                                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                                                        : 'bg-white border border-gray-200'
                                                                }`}
                                                            >
                                                                <p className="text-sm">
                                                                    {
                                                                        entry.message
                                                                    }
                                                                </p>
                                                                {entry.context_used && (
                                                                    <div className="text-xs mt-2 opacity-75">
                                                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                                                        Context
                                                                        used
                                                                        from
                                                                        knowledge
                                                                        base
                                                                    </div>
                                                                )}
                                                                <div className="text-xs mt-2 opacity-50">
                                                                    {new Date(
                                                                        entry.timestamp
                                                                    ).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="flex space-x-2 mt-4">
                                        <Input
                                            value={chatInput}
                                            onChange={(e) =>
                                                setChatInput(e.target.value)
                                            }
                                            placeholder="Type your message..."
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                !isExecuting &&
                                                handleChatSubmit()
                                            }
                                            disabled={isExecuting}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleChatSubmit}
                                            disabled={
                                                !chatInput.trim() || isExecuting
                                            }
                                            className="px-6"
                                        >
                                            {isExecuting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Send'
                                            )}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Divider */}
                            <div className="h-6 w-px bg-gray-300"></div>

                            {hasUnsavedChanges && (
                                <span className="text-sm text-amber-600 flex items-center">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                    Unsaved changes
                                </span>
                            )}

                            <Button
                                variant="outline"
                                onClick={handleSaveMetadata}
                                disabled={!hasUnsavedChanges || isSaving}
                                className="inline-flex items-center px-4 py-2  text-black rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ReactFlow Editor - Content below fixed navbar */}
            <div className="flex-1 overflow-hidden pt-14">
                <ReactFlowDemo
                    workflowId={workflowId}
                    initialNodes={workflow.nodes || []}
                    initialEdges={workflow.edges || []}
                />
            </div>
        </div>
    );
};

export default WorkflowEditor;
