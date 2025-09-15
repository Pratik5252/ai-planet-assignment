import { Position } from '@xyflow/react';

import { CustomHandle } from './CustomHandle';
import {
    BaseNode,
    BaseNodeContent,
    BaseNodeFooter,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from '@/components/base-node';

import { FileInput } from 'lucide-react';
import { Textarea } from './components/ui/textarea';

const CustomNode = () => {
    return (
        <BaseNode className="hover:ring-fuchsia-300 w-2xs">
            <BaseNodeHeader className="">
                <BaseNodeHeaderTitle className="flex justify-start items-center gap-2">
                    <FileInput size={16} />
                    User Query
                </BaseNodeHeaderTitle>
            </BaseNodeHeader>
            <BaseNodeContent className="p-0 border-t">
                <div className="bg-[#EDF3FF] px-3 py-2">
                    <p>Enter point for querys</p>
                </div>
                <div className="flex flex-col  gap-2 p-3">
                    <label htmlFor="text_query">User Query</label>
                    <Textarea
                        placeholder="Write your query here"
                        id="text_query"
                        className="nodrag"
                    />
                </div>
            </BaseNodeContent>
            <BaseNodeFooter className="flex flex-row items-center justify-end gap-4 px-0">
                <label className="text-xs">Query</label>
                <CustomHandle
                    id="query"
                    position={Position.Right}
                    type="target"
                    style={{ background: '#2196F3' }}
                />
            </BaseNodeFooter>
        </BaseNode>
    );
};

export default CustomNode;
