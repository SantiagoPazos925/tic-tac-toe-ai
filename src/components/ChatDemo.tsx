import { motion } from 'motion/react';
import { useState } from 'react';
import { Message } from '../types';

interface ChatDemoProps {
    onClose: () => void;
}

export const ChatDemo = ({ onClose }: ChatDemoProps) => {
    const [showDemo, setShowDemo] = useState(true);

    const demoMessages: Message[] = [
        {
            id: '1',
            content: '¡Hola a todos! ¿Cómo están?',
            sender: 'Pedro',
            timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
            type: 'user',
            reactions: [
                { emoji: '👍', users: ['Pedro', 'Ana'], count: 2 },
                { emoji: '👋', users: ['Carlos'], count: 1 }
            ],
            isEdited: false
        },
        {
            id: '2',
            content: '¡Hola Pedro! Todo bien por aquí, ¿qué tal tu día?',
            sender: 'Ana',
            timestamp: new Date(Date.now() - 240000), // 4 minutos atrás
            type: 'user',
            reactions: [
                { emoji: '😊', users: ['Pedro'], count: 1 }
            ],
            isEdited: false
        },
        {
            id: '3',
            content: '¡Perfecto! Me alegra escuchar eso. ¿Quieres jugar una partida?',
            sender: 'Pedro',
            timestamp: new Date(Date.now() - 180000), // 3 minutos atrás
            type: 'user',
            replyTo: {
                id: '2',
                sender: 'Ana',
                content: '¡Hola Pedro! Todo bien por aquí, ¿qué tal tu día?',
                emoji: '😊'
            },
            reactions: [
                { emoji: '🎮', users: ['Ana'], count: 1 }
            ],
            isEdited: false
        },
        {
            id: '4',
            content: '¡Claro! Me encantaría jugar contigo',
            sender: 'Ana',
            timestamp: new Date(Date.now() - 120000), // 2 minutos atrás
            type: 'user',
            replyTo: {
                id: '3',
                sender: 'Pedro',
                content: '¡Perfecto! Me alegra escuchar eso. ¿Quieres jugar una partida?',
                emoji: '🎮'
            },
            reactions: [
                { emoji: '🎯', users: ['Pedro', 'Carlos'], count: 2 },
                { emoji: '🔥', users: ['Ana'], count: 1 }
            ],
            isEdited: false
        }
    ];

    const handleClose = () => {
        setShowDemo(false);
        setTimeout(onClose, 300);
    };

    return (
        <motion.div
            className="chat-demo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: showDemo ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="chat-demo-modal"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: showDemo ? 1 : 0.8, y: showDemo ? 0 : 50 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ duration: 0.3 }}
            >
                <div className="demo-header">
                    <h3>🎮 Nuevas Funcionalidades del Chat</h3>
                    <button className="demo-close-btn" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <div className="demo-content">
                    <div className="demo-features">
                        <div className="feature-item">
                            <span className="feature-icon">💬</span>
                            <div className="feature-text">
                                <h4>Responder a Mensajes</h4>
                                <p>Haz hover sobre un mensaje y haz clic en "Responder" para crear una respuesta contextual</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <span className="feature-icon">😊</span>
                            <div className="feature-text">
                                <h4>Reacciones con Emojis</h4>
                                <p>Agrega reacciones rápidas (👻, 🙏, 👍, 😊) o usa el botón "+" para más opciones</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <div className="feature-text">
                                <h4>Acciones Rápidas</h4>
                                <p>Reenviar mensajes, más opciones y acciones adicionales disponibles al hacer hover</p>
                            </div>
                        </div>
                    </div>

                    <div className="demo-messages">
                        <h4>Ejemplo de Mensajes:</h4>
                        {demoMessages.map(message => (
                            <div key={message.id} className="demo-message">
                                <div className="demo-message-header">
                                    <span className="demo-sender">{typeof message.sender === 'string' ? message.sender : message.sender?.username || 'Usuario'}</span>
                                    <span className="demo-timestamp">
                                        {message.timestamp.toLocaleTimeString('es-ES', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                                <div className="demo-message-content">
                                    {message.replyTo && (
                                        <div className="demo-reply-preview">
                                            <span>↩️ {message.replyTo.sender}: {message.replyTo.content}</span>
                                        </div>
                                    )}
                                    <p>{message.content}</p>
                                </div>
                                {message.reactions && message.reactions.length > 0 && (
                                    <div className="demo-reactions">
                                        {message.reactions.map((reaction, index) => (
                                            <span key={index} className="demo-reaction">
                                                {reaction.emoji} {reaction.count}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="demo-footer">
                    <button className="demo-start-btn" onClick={handleClose}>
                        ¡Empezar a Usar!
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}; 