import { Handle, Position } from '@xyflow/react';

interface CustomHandleProps {
    position: Position;
    type?: 'source' | 'target';
    id?: string;
    style?: React.CSSProperties;
    label?: string;
    labelStyle?: React.CSSProperties;
}

export function CustomHandle({
    position,
    type = 'target',
    id,
    style = {},
    label,
    labelStyle = {},
}: CustomHandleProps) {
    return (
        <div className="relative">
            <Handle
                type={type}
                position={position}
                id={id}
                // Allow connection to any node/handle
                isValidConnection={() => true}
                onConnect={(params) => console.log('handle onConnect', params)}
                style={{
                    background: '#2196F3',
                    border: '2px solid #fff',
                    width: 8,
                    height: 8,
                    ...style,
                }}
            />
        </div>
    );
}
