import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

interface CustomEdgeProps extends EdgeProps {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    ...props
}: CustomEdgeProps) => {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    stroke: '#000',
                    strokeDasharray: '5,5',
                    ...style,
                }}
                markerEnd="url(#arrow)"
                {...props}
            />
        </>
    );
};

export default CustomEdge;
