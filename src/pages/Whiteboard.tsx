import React, { useState, useRef, useEffect } from 'react';
import ToolBox from '../components/ToolBox';

interface DrawingAction {
  tool: string;
  color: string;
  size: number;
  path: { x: number; y: number }[];
}

const WhiteBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [redoActions, setRedoActions] = useState<DrawingAction[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      setCtx(context);
      
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      if (context) {
        context.scale(2, 2); // For retina display
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = size;
      }
    }
  }, []);

  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = size / scale;
    }
  }, [ctx, color, size, scale]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'pan') {
      setIsPanning(true);
      setLastPanPoint(getMousePos(e));
    } else {
      setIsDrawing(true);
      const point = getScaledMousePos(e);
      setCurrentPath([point]);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (currentPath.length > 1) {
        setActions([...actions, { tool, color, size, path: currentPath }]);
        setRedoActions([]);
      }
      setCurrentPath([]);
    }
    setIsPanning(false);
    setLastPanPoint(null);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0)
    };
  };

  const getScaledMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const pos = getMousePos(e);
    return {
      x: (pos.x / scale) - offset.x,
      y: (pos.y / scale) - offset.y
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && lastPanPoint) {
      const currentPoint = getMousePos(e);
      const dx = (currentPoint.x - lastPanPoint.x) / scale;
      const dy = (currentPoint.y - lastPanPoint.y) / scale;
      setOffset({ x: offset.x - dx, y: offset.y - dy });
      setLastPanPoint(currentPoint);
      redrawCanvas();
    } else if (isDrawing && ctx) {
      const currentPoint = getScaledMousePos(e);
      setCurrentPath([...currentPath, currentPoint]);

      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      ctx.lineWidth = size / scale;

      ctx.save();
      ctx.scale(scale, scale);
      ctx.translate(offset.x, offset.y);

      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);

      if (tool === 'pencil' || tool === 'eraser') {
        currentPath.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
      } else if (tool === 'square') {
        const width = currentPoint.x - currentPath[0].x;
        const height = currentPoint.y - currentPath[0].y;
        ctx.rect(currentPath[0].x, currentPath[0].y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - currentPath[0].x, 2) +
          Math.pow(currentPoint.y - currentPath[0].y, 2)
        );
        ctx.arc(currentPath[0].x, currentPath[0].y, radius, 0, 2 * Math.PI);
      }

      ctx.stroke();
      ctx.restore();
    }
  };

  const redrawCanvas = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offset.x, offset.y);

    actions.forEach(action => {
      ctx.beginPath();
      ctx.strokeStyle = action.tool === 'eraser' ? '#FFFFFF' : action.color;
      ctx.lineWidth = action.size / scale;

      if (action.tool === 'pencil' || action.tool === 'eraser') {
        action.path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
      } else if (action.tool === 'square') {
        const width = action.path[action.path.length - 1].x - action.path[0].x;
        const height = action.path[action.path.length - 1].y - action.path[0].y;
        ctx.rect(action.path[0].x, action.path[0].y, width, height);
      } else if (action.tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(action.path[action.path.length - 1].x - action.path[0].x, 2) +
          Math.pow(action.path[action.path.length - 1].y - action.path[0].y, 2)
        );
        ctx.arc(action.path[0].x, action.path[0].y, radius, 0, 2 * Math.PI);
      }

      ctx.stroke();
    });

    ctx.restore();
  };

  const handleUndo = () => {
    if (actions.length === 0) return;
    const lastAction = actions[actions.length - 1];
    setActions(actions.slice(0, -1));
    setRedoActions([...redoActions, lastAction]);
    redrawCanvas();
  };

  const handleRedo = () => {
    if (redoActions.length === 0) return;
    const actionToRedo = redoActions[redoActions.length - 1];
    setRedoActions(redoActions.slice(0, -1));
    setActions([...actions, actionToRedo]);
    redrawCanvas();
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.1 : 0.9;
    setScale(scale * zoomFactor);
    redrawCanvas();
  };

  return (
    <div className="h-screen overflow-hidden bg-white w-[95%] mx-auto border rounded relative">
      {/* <div className="fixed top-4 left-4 bg-white rounded-lg shadow-md p-4">
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
      </div> */}
      <ToolBox
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleZoom={handleZoom}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
      />
    </div>
  );
};



export default WhiteBoard;