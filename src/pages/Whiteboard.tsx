import React, { useState, useRef, useEffect } from 'react';
import ToolBox from '../components/ToolBox';
import { io, Socket } from 'socket.io-client';

interface DrawingAction {
  id?: string;
  tool: string;
  color: string;
  size: number;
  path: { x: number; y: number }[];
  timestamp?: number;
}

const WhiteBoard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

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
    const newSocket = io('https://collaborator-be.onrender.com', {
      transports: ['websocket'],
      upgrade: false,
    });
    // const newSocket = io('https://collaborator-be.onrender.com');
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log("Connected to server");
      const roomId = window.location.pathname.split('/').pop();
      // get room ID from URL params
      newSocket.emit('joinRoom', roomId);
    })

    newSocket.on('initialState', (initialState: DrawingAction[]) => {
      setActions(initialState);
      redrawCanvas();
    });

    newSocket.on('drawAction', (action: DrawingAction) => {
      setActions(prevActions => {
        const newAction = [...prevActions, action]
        redrawCanvas();
        return newAction;
      });
      redrawCanvas();
    })

    newSocket.on('undo', (actionId: string) => {
      setActions(prevActions => {
        const newActions = prevActions.filter(action => action.id !== actionId);
        redrawCanvas();
        return newActions;
      });
      setRedoActions(prevRedoActions => [...prevRedoActions]);
    })

    newSocket.on('redo', (action: DrawingAction) => {
      setActions(prevActions => {
        const newActions = [...prevActions, action];
        redrawCanvas();
        return newActions;
      });
      setRedoActions(prevRedoActions => prevRedoActions.filter(a => a.id !== action.id));
    })

    return () => {
      newSocket.disconnect();
    }
  }, []);


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
      socket?.emit('startPan');
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
        const newAction: DrawingAction = {
          id: Date.now().toString(),
          tool,
          color,
          size,
          path: currentPath,
          timestamp: Date.now(),
        };

        setActions(prevActions => [...prevActions, newAction]);
        setRedoActions([]);
        socket?.emit('drawAction', newAction);
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
      redrawCanvas();
      drawCurrentAction(ctx);
    }
  };

  const drawCurrentAction = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offset.x, offset.y);

    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = size / scale;

    ctx.beginPath();
    if (tool === 'pencil' || tool === 'eraser') {
      currentPath.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
    } else if (tool === 'square') {
      const startPoint = currentPath[0];
      const endPoint = currentPath[currentPath.length - 1];
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      ctx.rect(startPoint.x, startPoint.y, width, height);
    } else if (tool === 'circle') {
      const startPoint = currentPath[0];
      const endPoint = currentPath[currentPath.length - 1];
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2)
      );
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
    }
    ctx.stroke();

    ctx.restore();
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
    setRedoActions(prevRedoActions => [...prevRedoActions, lastAction]);
    socket?.emit('undo', lastAction.id);
    redrawCanvas();
  };

  const handleRedo = () => {
    if (redoActions.length === 0) return;
    const actionToRedo = redoActions[redoActions.length - 1];
    setRedoActions(redoActions.slice(0, -1));
    setActions(prevActions => [...prevActions, actionToRedo]);
    socket?.emit('redo', actionToRedo);
    redrawCanvas();
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.1 : 0.9;
    setScale(scale * zoomFactor);
    redrawCanvas();
  };

  return (
    <div className="h-screen overflow-hidden bg-white w-[95%] mx-auto border rounded relative">
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