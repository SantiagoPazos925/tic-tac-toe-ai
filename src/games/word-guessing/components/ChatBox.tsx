import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
    messages: ChatMessage[];
    chatMessage: string;
    setChatMessage: (message: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    isDrawing: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({
    messages,
    chatMessage,
    setChatMessage,
    onSendMessage,
    isDrawing
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white/10 rounded-lg p-3 mb-3">
                <h3 className="text-lg font-bold text-white mb-2">
                    💬 Chat
                </h3>
                {isDrawing && (
                    <p className="text-sm text-yellow-300 mb-2">
                        ⚠️ No puedes chatear mientras dibujas
                    </p>
                )}
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto bg-white/5 rounded-lg p-3 mb-3" style={{ maxHeight: '320px', minHeight: '120px' }}>
                <div className="space-y-2">
                    {messages.length === 0 ? (
                        <div className="text-center text-white/60 py-4">
                            <p>No hay mensajes aún</p>
                            <p className="text-sm">¡Sé el primero en escribir!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`p-2 rounded-lg ${message.isCorrectGuess
                                    ? 'bg-green-500/20 border border-green-500/30'
                                    : 'bg-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-white text-sm">
                                        {message.playerName}
                                    </span>
                                    <span className="text-xs text-white/60">
                                        {formatTime(message.timestamp)}
                                    </span>
                                </div>
                                <p className={`text-sm ${message.isCorrectGuess
                                    ? 'text-green-300 font-bold'
                                    : 'text-white'
                                    }`}>
                                    {message.isCorrectGuess && '🎉 '}
                                    {message.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <form onSubmit={onSendMessage} className="flex space-x-2">
                <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={isDrawing ? "No puedes chatear mientras dibujas" : "Escribe tu mensaje..."}
                    disabled={isDrawing}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={isDrawing || !chatMessage.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default ChatBox; 