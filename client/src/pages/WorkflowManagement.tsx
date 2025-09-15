import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Calendar, Activity } from 'lucide-react';
import {
    useWorkflows,
    useCreateWorkflow,
    type Workflow,
} from '../hooks/useWorkFlowAPI';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const WorkflowManagement: React.FC = () => {
    const navigate = useNavigate();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newWorkflowName, setNewWorkflowName] = useState('');
    const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

    const { data: workflows = [], isLoading, error } = useWorkflows();
    const { mutate: createWorkflow, isPending: isCreating } =
        useCreateWorkflow();

    const handleCreateWorkflow = () => {
        if (!newWorkflowName.trim()) return;

        createWorkflow(
            {
                name: newWorkflowName.trim(),
                description: newWorkflowDescription.trim() || undefined,
            },
            {
                onSuccess: (workflow) => {
                    setShowCreateDialog(false);
                    setNewWorkflowName('');
                    setNewWorkflowDescription('');
                    navigate(`/workflow/${workflow.id}`);
                },
                onError: (error) => {
                    console.error('Failed to create workflow:', error);
                },
            }
        );
    };

    const handleEditWorkflow = (workflowId: number) => {
        navigate(`/workflow/${workflowId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getNodeCount = (workflow: Workflow) => {
        return workflow.nodes?.length || 0;
    };

    const getEdgeCount = (workflow: Workflow) => {
        return workflow.edges?.length || 0;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading workflows...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">
                        Error loading workflows: {error.message}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Header - Fixed Full Width Navbar */}
            <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                AI Workflow Builder
                            </h1>
                            <p className="text-gray-600">
                                Create and manage your AI workflow stacks
                            </p>
                        </div>
                        <Dialog
                            open={showCreateDialog}
                            onOpenChange={setShowCreateDialog}
                        >
                            <DialogTrigger asChild>
                                <Button className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                                    <Plus className="w-5 h-5 mr-2" />
                                    New Stack
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Main Content - Content below fixed navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
                {workflows.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Activity className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No workflows yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Get started by creating your first AI workflow stack
                        </p>
                        <Dialog
                            open={showCreateDialog}
                            onOpenChange={setShowCreateDialog}
                        >
                            <DialogTrigger asChild>
                                <Button className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create Your First Workflow
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                ) : (
                    /* Workflows Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className="h-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className=" py-6 px-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-full flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {workflow.name}
                                            </h3>
                                            {/* {workflow.description && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {workflow.description}
                                                </p>
                                            )} */}
                                        </div>
                                        <div
                                            className={`ml-3 flex-shrink-0 w-2 h-2 rounded-full ${
                                                workflow.is_active
                                                    ? 'bg-green-400'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                    </div>

                                    {/* Workflow Stats */}
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center">
                                            <Activity className="w-4 h-4 mr-1" />
                                            {getNodeCount(workflow)} nodes
                                        </span>
                                        <span>
                                            {getEdgeCount(workflow)} connections
                                        </span>
                                    </div>

                                   
                                    {/* <div className="flex items-center text-xs text-gray-500 mb-4">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>
                                            Updated{' '}
                                            {formatDate(workflow.updated_at)}
                                        </span>
                                    </div> */}

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleEditWorkflow(workflow.id)
                                            }
                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-black text-sm rounded-md  transition-colors"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Workflow Dialog using Shadcn */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Workflow</DialogTitle>
                        <DialogDescription>
                            Create a new AI workflow stack to get started.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Name *
                            </label>
                            <Input
                                id="name"
                                type="text"
                                value={newWorkflowName}
                                onChange={(e) =>
                                    setNewWorkflowName(e.target.value)
                                }
                                placeholder="Enter workflow name"
                                disabled={isCreating}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Description
                            </label>
                            <Textarea
                                id="description"
                                value={newWorkflowDescription}
                                onChange={(e) =>
                                    setNewWorkflowDescription(e.target.value)
                                }
                                placeholder="Optional description"
                                rows={3}
                                disabled={isCreating}
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                            className="flex-1"
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateWorkflow}
                            disabled={!newWorkflowName.trim() || isCreating}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WorkflowManagement;
