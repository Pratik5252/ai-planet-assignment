import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from '@/components/ui/sidebar';
import {
    FileInput,
    GripVertical,
    Sparkles,
    BookOpen,
    FileOutput,
} from 'lucide-react';
import { useDnD } from './DnDContext';

interface DraggableNodeProps {
    type: string;
    label: string;
    icon: React.ElementType;
}

function DraggableNode({ type, label, icon: Icon }: DraggableNodeProps) {
    const [, setType] = useDnD();

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        console.log('Drag started for type:', nodeType);
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={(event) => onDragStart(event, type)}
            className="flex items-center gap-3 p-3 border rounded-md cursor-grab hover:shadow-md transition-all duration-200 active:cursor-grabbing"
        >
            <div className="flex items-center gap-2 flex-grow text-foreground">
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <GripVertical size={16} className="text-gray-500" />
        </div>
    );
}

function AppSidebar() {
    const nodeComponents = [
        {
            type: 'userQuery',
            label: 'User Query',
            icon: FileInput,
        },
        {
            type: 'knowledgeBase',
            label: 'Knowledge Base',
            icon: BookOpen,
        },
        {
            type: 'llmEngine',
            label: 'LLM Engine',
            icon: Sparkles,
        },
        {
            type: 'output',
            label: 'Output',
            icon: FileOutput,
        },
    ];

    return (
        <Sidebar className="border-r pt-14">
            <SidebarHeader className="p-4">
                <h2 className="text-lg font-semibold">Components</h2>
                <p className="text-sm text-gray-600">
                    Drag components to the canvas
                </p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="p-4">
                    <div className="space-y-3">
                        {nodeComponents.map((component) => (
                            <DraggableNode
                                key={component.type}
                                type={component.type}
                                label={component.label}
                                icon={component.icon}
                            />
                        ))}
                    </div>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <div className="text-xs text-gray-500">
                    <p>💡 Tip: Drag components to canvas and connect them</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

export default AppSidebar;
