import { Pencil, Eraser, Square, Circle, Palette, Undo, Redo, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

const ToolBox = (
    { tool, setTool, color, setColor, size, setSize, handleUndo, handleRedo, handleZoom }: ToolBoxProps
) => {

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const hasDragged = useRef(false);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initialX = window.innerWidth - 100;
        const initialY = window.innerHeight - 100;
        setPosition({ x: initialX, y: initialY });
    }, []);

    const handleStart = (clientX: number, clientY: number) => {
        setDragging(true);
        setOffset({
            x: clientX - position.x,
            y: clientY - position.y,
        });
        hasDragged.current = false;
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (dragging) {
            setPosition({
                x: clientX - offset.x,
                y: clientY - offset.y,
            });
            hasDragged.current = true;
        }
    };

    const handleEnd = () => {
        setDragging(false);
    };

    const handleResize = () => {
        const initialX = window.innerWidth - 100;
        const initialY = window.innerHeight - 100;
        setPosition({ x: initialX, y: initialY });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('resize', handleResize);
        };
    }, [dragging, offset]);

    return (
        <div ref={divRef}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
                const touch = e.touches[0];
                handleStart(touch.clientX, touch.clientY);
            }}
            className="fixed top-4 left-4 bg-white rounded-lg shadow-md p-4">
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
    )
}

export default ToolBox