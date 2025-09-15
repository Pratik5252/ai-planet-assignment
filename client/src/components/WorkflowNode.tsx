import { useCallback, useState } from 'react';
import { CustomHandle } from '../CustomHandle';
import {
    BaseNode,
    BaseNodeContent,
    BaseNodeFooter,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from '@/components/base-node';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    type WorkflowNodeConfig,
    type NodeField,
} from '../types/workflow-nodes';
import { cn } from '@/lib/utils';
import { Upload, Eye, EyeOff } from 'lucide-react';

interface WorkflowNodeProps {
    config: WorkflowNodeConfig;
    data?: Record<string, string | number | boolean>;
    onDataChange?: (data: Record<string, string | number | boolean>) => void;
    className?: string;
}

export function WorkflowNode({
    config,
    data = {},
    onDataChange,
    className,
}: WorkflowNodeProps) {
    const [values, setValues] =
        useState<Record<string, string | number | boolean>>(data);
    const [showApi, setShowApi] = useState<Record<string, boolean>>(
        {}
    );

    const handleFieldChange = useCallback(
        (fieldId: string, value: string | number | boolean) => {
            const newValues = { ...values, [fieldId]: value };
            setValues(newValues);
            onDataChange?.(newValues);
        },
        [values, onDataChange]
    );

    const renderField = (field: NodeField) => {
        const value = values[field.id] || field.defaultValue || '';

        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea
                        key={field.id}
                        id={field.id}
                        placeholder={field.placeholder}
                        value={value as string}
                        onChange={(e) =>
                            handleFieldChange(field.id, e.target.value)
                        }
                        className={cn('nodrag', field.className)}
                    />
                );

            case 'input':
                return (
                    <div key={field.id} className="relative">
                        <Input
                            type={showApi[field.id] ? 'text' : 'password'}
                            key={field.id}
                            id={field.id}
                            placeholder={field.placeholder}
                            value={value as string}
                            onChange={(e) =>
                                handleFieldChange(field.id, e.target.value)
                            }
                            className={cn('nodrag pr-10', field.className)}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                                setShowApi((prev) => ({
                                    ...prev,
                                    [field.id]: !prev[field.id],
                                }))
                            }
                        >
                            {showApi[field.id] ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                );

            case 'select':
                return (
                    <Select>
                        <SelectTrigger className="w-full">
                            <SelectValue
                                placeholder="Select Model"
                                defaultValue={1}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'toggle':
                return (
                    <div key={field.id} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={field.id}
                            checked={value as boolean}
                            onChange={(e) =>
                                handleFieldChange(field.id, e.target.checked)
                            }
                            className="nodrag"
                        />
                        <label htmlFor={field.id} className="text-sm">
                            {field.label}
                        </label>
                    </div>
                );

            case 'file':
                return (
                    <div key={field.id} className="relative">
                        <input
                            type="file"
                            id={field.id}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFieldChange(field.id, file.name);
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer nodrag z-10"
                            accept={field.accept}
                        />
                        <Button
                            variant="outline"
                            className={cn(
                                'nodrag w-full h-12 text-emerald-600 border-emerald-300 border-dashed hover:border-emerald-400 hover:bg-emerald-50 transition-colors relative overflow-hidden px-6 py-10', // Increased height and padding
                                field.className
                            )}
                            type="button"
                        >
                            <div className="flex items-center justify-center gap-3 w-full">
                                {' '}
                                {/* Increased gap */}
                                <Upload
                                    size={16}
                                    className="text-emerald-600"
                                />
                                <span className="text-sm truncate">
                                    {values[field.id]
                                        ? `📄 ${values[field.id]}`
                                        : field.placeholder || 'Choose File'}
                                </span>
                            </div>
                        </Button>
                    </div>
                );

            case 'number':
                return (
                    <Input
                        key={field.id}
                        id={field.id}
                        type="number"
                        placeholder={field.placeholder}
                        value={value as string}
                        onChange={(e) =>
                            handleFieldChange(field.id, e.target.value)
                        }
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        className={cn('nodrag', field.className)}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <BaseNode className={cn('hover:ring-2', 'w-2xs shadow-md', className)}>
            <BaseNodeHeader
                className="rounded-md"
                style={{ backgroundColor: config.bgColor }}
            >
                <BaseNodeHeaderTitle className="flex justify-start items-center gap-2">
                    <config.icon size={16} />
                    <span style={{ color: config.color }}>{config.title}</span>
                </BaseNodeHeaderTitle>
            </BaseNodeHeader>

            <BaseNodeContent className="p-0 border-t text-left ">
                <div className="bg-[#EDF3FF] px-3 py-2">
                    <p className="text-sm">{config.description}</p>
                </div>

                {config.fields.length > 0 && (
                    <div className="flex flex-col gap-3 p-3">
                        {config.fields.map((field) => (
                            <div key={field.id} className="flex flex-col gap-2">
                                {field.type !== 'toggle' && (
                                    <label
                                        htmlFor={field.id}
                                        className="text-sm font-medium"
                                    >
                                        {field.label}
                                        {field.required && (
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>
                                )}
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                )}
            </BaseNodeContent>

            <BaseNodeFooter className="flex flex-row items-center justify-between px-0 py-2">
                {/* Source handles (left side) */}
                <div className="flex flex-col gap-2">
                    {config.handles
                        .filter((handle) => handle.type === 'target')
                        .map((handle) => (
                            <div
                                key={handle.id}
                                className="flex items-center gap-2"
                            >
                                <CustomHandle
                                    id={handle.id}
                                    position={handle.position}
                                    type={handle.type}
                                    style={handle.style}
                                />
                                {handle.label && (
                                    <span className="text-xs text-gray-600">
                                        {handle.label}
                                    </span>
                                )}
                            </div>
                        ))}
                </div>

                {/* Target handles (right side) */}
                <div className="flex flex-col gap-2">
                    {config.handles
                        .filter((handle) => handle.type === 'source')
                        .map((handle) => (
                            <div
                                key={handle.id}
                                className="flex items-center gap-2"
                            >
                                {handle.label && (
                                    <span className="text-xs text-gray-600">
                                        {handle.label}
                                    </span>
                                )}
                                <CustomHandle
                                    id={handle.id}
                                    position={handle.position}
                                    type={handle.type}
                                    style={handle.style}
                                />
                            </div>
                        ))}
                </div>
            </BaseNodeFooter>
        </BaseNode>
    );
}
