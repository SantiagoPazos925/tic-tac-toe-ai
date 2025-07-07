import React, { useRef, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { DrawingPoint } from '../types';
import './DrawingCanvas.css'; // Archivo de estilos personalizado

interface DrawingCanvasProps {
    isDrawing: boolean;
    drawingData: DrawingPoint[];
    onDraw: (point: DrawingPoint) => void;
    hiddenWordDisplay: string;
    currentWord: string;
    timeRemaining: number;
    roomId: string;
}

const TOOL_PENCIL = 'pencil';
const TOOL_ERASER = 'eraser';
const TOOL_EYEDROPPER = 'eyedropper';

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ isDrawing, drawingData, onDraw, hiddenWordDisplay, currentWord, timeRemaining, roomId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [brushSize, setBrushSize] = useState(16);
    const [brushOpacity, setBrushOpacity] = useState(1);
    const [brushColor, setBrushColor] = useState('#000000');
    const [selectedTool, setSelectedTool] = useState(TOOL_PENCIL);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [history, setHistory] = useState<DrawingPoint[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawingPoint[][]>([]);
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);
    const [wasJustCleared, setWasJustCleared] = useState(false);

    const colors = [
        '#000000', '#808080', '#C0C0C0', '#FFFFFF',
        '#FF0000', '#FFA500', '#FFFF00', '#008000',
        '#00FFFF', '#0000FF', '#800080', '#FF00FF',
        '#A52A2A', '#FFD700', '#00FF00', '#40E0D0',
        '#1E90FF', '#8A2BE2', '#FF69B4', '#FF6347'
    ];

    // Obtener el userId persistente
    const userId = localStorage.getItem('userId') || '';

    // Sonido tic-tac para cuenta regresiva (solo una vez al llegar a 10 segundos)
    const ticTacRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        if (timeRemaining === 10) {
            if (!ticTacRef.current) {
                ticTacRef.current = new Audio('/tic-tac.wav');
            }
            ticTacRef.current.currentTime = 0;
            ticTacRef.current.play();
        }
        if (timeRemaining === 0 && ticTacRef.current) {
            ticTacRef.current.pause();
            ticTacRef.current.currentTime = 0;
        }
    }, [timeRemaining]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Configurar canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Dibujar datos existentes
        drawingData.forEach((point, index) => {
            if (index === 0) {
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
            } else {
                const prevPoint = drawingData[index - 1];
                if (prevPoint.isDrawing) {
                    ctx.lineTo(point.x, point.y);
                } else {
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                }
            }
            ctx.strokeStyle = point.color;
            ctx.globalAlpha = point.opacity ?? 1;
            ctx.lineWidth = point.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (!point.isDrawing) {
                ctx.stroke();
            }
        });
        if (drawingData.length > 0) {
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }, [drawingData]);

    // Dibuja el círculo de la goma en el overlay
    useEffect(() => {
        const overlay = overlayRef.current;
        const canvas = canvasRef.current;
        if (!overlay || !canvas) return;
        // Ajustar el tamaño del overlay al tamaño visible del canvas (CSS)
        const rect = canvas.getBoundingClientRect();
        overlay.width = rect.width;
        overlay.height = rect.height;
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.left = canvas.offsetLeft + 'px';
        overlay.style.top = canvas.offsetTop + 'px';
        const ctx = overlay.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        if (isDrawing && selectedTool === TOOL_ERASER && cursorPos) {
            ctx.save();
            // Ajustar la posición del círculo según el zoom y el tamaño visual
            const scale = rect.width / canvas.width;
            const x = cursorPos.x * scale;
            const y = cursorPos.y * scale;
            ctx.beginPath();
            ctx.arc(x, y, (brushSize / 2) * scale, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }, [isDrawing, selectedTool, cursorPos, brushSize, zoom]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / zoom,
            y: (e.clientY - rect.top) / zoom
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        setIsMouseDown(true);
        setWasJustCleared(false);
        const pos = getMousePos(e);
        onDraw({
            x: pos.x,
            y: pos.y,
            color: selectedTool === TOOL_ERASER ? '#FFFFFF' : brushColor,
            size: brushSize,
            opacity: brushOpacity,
            isDrawing: true,
            userId
        });
        setHistory([...history, drawingData]);
        setRedoStack([]);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || wasJustCleared) return;
        const pos = getMousePos(e);
        setCursorPos(pos);
        if (!isMouseDown) return;
        onDraw({
            x: pos.x,
            y: pos.y,
            color: selectedTool === TOOL_ERASER ? '#FFFFFF' : brushColor,
            size: brushSize,
            opacity: brushOpacity,
            isDrawing: true,
            userId
        });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        setIsMouseDown(false);
        const pos = getMousePos(e);
        onDraw({
            x: pos.x,
            y: pos.y,
            color: selectedTool === TOOL_ERASER ? '#FFFFFF' : brushColor,
            size: brushSize,
            opacity: brushOpacity,
            isDrawing: false,
            userId
        });
    };

    const handleMouseLeave = () => {
        setIsMouseDown(false);
        setCursorPos(null);
    };

    // Determinar el cursor según la herramienta
    let canvasCursor = 'default';
    if (selectedTool === TOOL_ERASER) {
        canvasCursor = 'none';
    } else if (selectedTool === TOOL_EYEDROPPER) {
        canvasCursor = 'crosshair';
    } else if (selectedTool === TOOL_PENCIL && isDrawing) {
        canvasCursor = 'crosshair';
    }

    // Eyedropper: obtener color del canvas
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (selectedTool === TOOL_EYEDROPPER) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / zoom);
            const y = Math.floor((e.clientY - rect.top) / zoom);
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
            // Convertir a hex
            const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
            setBrushColor(hex);
            setSelectedTool(TOOL_PENCIL); // Volver al lápiz automáticamente
        }
    };

    // Herramientas
    const handleUndo = () => {
        if (history.length > 0) {
            setRedoStack([drawingData, ...redoStack]);
            const prev = history[history.length - 1];
            setHistory(history.slice(0, -1));
            // Notificar al backend y actualizar el dibujo en pantalla
            if (typeof (window as any).socket !== 'undefined') {
                const socket = (window as any).socket;
                if (socket && isDrawing) {
                    socket.emit('word-guessing-drawing-update', { roomId, drawingData: prev, userId });
                }
            }
        }
    };
    const handleRedo = () => {
        if (redoStack.length > 0) {
            setHistory([...history, drawingData]);
            const next = redoStack[0];
            setRedoStack(redoStack.slice(1));
            // Notificar al backend y actualizar el dibujo en pantalla
            if (typeof (window as any).socket !== 'undefined') {
                const socket = (window as any).socket;
                if (socket && isDrawing) {
                    socket.emit('word-guessing-drawing-update', { roomId, drawingData: next, userId });
                }
            }
        }
    };
    const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
    const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));

    // Limpiar canvas
    const handleClearCanvas = () => {
        setHistory([...history, drawingData]);
        setRedoStack([]);
        setIsMouseDown(false);
        setCursorPos(null);
        setWasJustCleared(true);
        // Limpiar el canvas localmente
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        // Notificar al backend si existe la función (opcional)
        if (typeof (window as any).socket !== 'undefined') {
            const socket = (window as any).socket;
            if (socket && isDrawing) {
                socket.emit('word-guessing-clear', { roomId, userId });
            }
        }
    };

    // Efecto para limpiar historial local cuando se limpia el canvas globalmente
    useEffect(() => {
        if (drawingData.length === 0) {
            setHistory([]);
            setRedoStack([]);
            setIsMouseDown(false);
            setCursorPos(null);
            setWasJustCleared(true);
        }
    }, [drawingData]);

    return (
        <div className="drawing-canvas-bg">
            <div className="drawing-canvas-container canvas-layout-row">
                {/* Barra de herramientas vertical solo para el que dibuja */}
                {isDrawing && (
                    <div className="toolbar-vertical">
                        <button className={selectedTool === TOOL_PENCIL ? 'active' : ''} onClick={() => setSelectedTool(TOOL_PENCIL)} title="Lápiz">
                            <span role="img" aria-label="Lápiz">✏️</span>
                        </button>
                        <button className={selectedTool === TOOL_ERASER ? 'active' : ''} onClick={() => setSelectedTool(TOOL_ERASER)} title="Goma">
                            <span role="img" aria-label="Goma">🧽</span>
                        </button>
                        <button className={selectedTool === TOOL_EYEDROPPER ? 'active' : ''} onClick={() => setSelectedTool(TOOL_EYEDROPPER)} title="Cuentagotas">
                            <span role="img" aria-label="Cuentagotas">🧪</span>
                        </button>
                        {/*  <button onClick={handleZoomIn} title="Zoom In">
                            <span role="img" aria-label="Zoom In">➕</span>
                        </button>
                        <button onClick={handleZoomOut} title="Zoom Out">
                            <span role="img" aria-label="Zoom Out">➖</span>
                        </button> */}
                        <button onClick={handleUndo} title="Deshacer (Ctrl+Z)" disabled={history.length === 0}>
                            <span role="img" aria-label="Deshacer">↩️</span>
                        </button>
                        <button onClick={handleRedo} title="Rehacer (Ctrl+Y)" disabled={redoStack.length === 0}>
                            <span role="img" aria-label="Rehacer">↪️</span>
                        </button>
                        <button onClick={handleClearCanvas} title="Limpiar Canvas">
                            <span role="img" aria-label="Limpiar">🗑️</span>
                        </button>
                    </div>
                )}
                {/* Canvas y paleta en la misma fila */}
                <div className="canvas-area-flex">
                    <div className="canvas-center-area">
                        {/* Header superior con temporizador y palabra */}
                        <div className="canvas-header">
                            <div className="canvas-header-left">
                                <span className="canvas-header-title">
                                    {isDrawing ? '🎨 Tu turno de dibujar' : '👀 Adivina la palabra'}
                                </span>
                            </div>
                            <div className="canvas-header-center">
                                {!isDrawing ? (
                                    <span className="canvas-header-word">
                                        {hiddenWordDisplay}
                                    </span>
                                ) : (
                                    <span className="canvas-header-word">
                                        {currentWord}
                                    </span>
                                )}
                            </div>
                            <div className="canvas-header-right">
                                <span className="canvas-header-timer">
                                    ⏰ {timeRemaining}
                                </span>
                            </div>
                        </div>
                        <div className="canvas-relative">
                            <canvas
                                ref={canvasRef}
                                className={`drawing-canvas canvas-scaled`}
                                style={{ cursor: canvasCursor }}
                                data-zoom={zoom}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                                onClick={handleCanvasClick}
                            />
                            {/* Canvas overlay para el círculo de la goma */}
                            <canvas
                                ref={overlayRef}
                                className="drawing-canvas-overlay"
                                style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 2 }}
                            />
                        </div>
                        {/* Sliders inferiores solo para el que dibuja */}
                        {isDrawing && (
                            <div className="canvas-sliders">
                                <div className="slider-group">
                                    <label>Thickness</label>
                                    <input type="range" min={1} max={40} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
                                    <span>{brushSize}</span>
                                </div>
                                <div className="slider-group">
                                    <label>Opacity</label>
                                    <input type="range" min={0.05} max={1} step={0.01} value={brushOpacity} onChange={e => setBrushOpacity(Number(e.target.value))} />
                                    <span>{Math.round(brushOpacity * 100)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Paleta de colores derecha solo para el que dibuja */}
                    {isDrawing && (
                        <div className="palette-right">
                            <div className="palette-colors">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        className={`palette-color-btn palette-color-btn-dynamic${brushColor === color ? ' palette-color-btn-active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => { setBrushColor(color); setShowColorPicker(false); }}
                                    />
                                ))}
                            </div>
                            <div
                                className="palette-selected-color palette-selected-color-dynamic"
                                style={{ backgroundColor: brushColor }}
                                onClick={() => setShowColorPicker(!showColorPicker)}
                            />
                            {showColorPicker && (
                                <div className="color-picker-popover">
                                    <SketchPicker
                                        color={brushColor}
                                        onChange={color => setBrushColor(color.hex)}
                                        disableAlpha={false}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrawingCanvas; 