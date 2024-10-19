import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Eraser, Square, Circle, Palette, Undo, Redo, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ToolBoxProps {
    tool: string;
    setTool: React.Dispatch<React.SetStateAction<string>>;
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;
    size: number;
    setSize: React.Dispatch<React.SetStateAction<number>>;
    handleUndo: () => void;
    handleRedo: () => void;
    handleZoom: (direction: 'in' | 'out') => void;
}

const ToolBox: React.FC<ToolBoxProps> = (
    { tool, setTool, color, setColor, size, setSize, handleUndo, handleRedo, handleZoom }
) => {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const toolboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragging) {
                const newX = e.clientX - offset.x;
                const newY = e.clientY - offset.y;
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, offset]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (toolboxRef.current && e.target === toolboxRef.current) {
            setDragging(true);
            setOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    return (
        <div
            ref={toolboxRef}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: dragging ? 'grabbing' : 'grab',
                userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            className="bg-white rounded-lg shadow-md p-4"
        >
            <div className="flex space-x-4 mb-4">
                <button
                    className={`p-2 rounded ${tool === 'pencil' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTool('pencil')}
                >
                    <Pencil size={24} />
                </button>
                <button
                    className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTool('eraser')}
                >
                    <Eraser size={24} />
                </button>
                <button
                    className={`p-2 rounded ${tool === 'square' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTool('square')}
                >
                    <Square size={24} />
                </button>
                <button
                    className={`p-2 rounded ${tool === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTool('circle')}
                >
                    <Circle size={24} />
                </button>
                <button
                    className={`p-2 rounded ${tool === 'pan' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setTool('pan')}
                >
                    <Move size={24} />
                </button>
            </div>
            <div className="flex space-x-4 mb-4">
                <button className="p-2 rounded bg-gray-200" onClick={handleUndo}>
                    <Undo size={24} />
                </button>
                <button className="p-2 rounded bg-gray-200" onClick={handleRedo}>
                    <Redo size={24} />
                </button>
                <button className="p-2 rounded bg-gray-200" onClick={() => handleZoom('in')}>
                    <ZoomIn size={24} />
                </button>
                <button className="p-2 rounded bg-gray-200" onClick={() => handleZoom('out')}>
                    <ZoomOut size={24} />
                </button>
            </div>
            <div className="flex items-center space-x-4">
                <Palette size={24} />
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-full"
                />
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-32"
                />
            </div>
        </div>
    );
};

export default ToolBox;