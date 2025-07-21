import { motion } from 'motion/react';
import React, { useRef, useState } from 'react';
import { useReactions } from '../hooks/useReactions';
import { Message, ReplyMessage } from '../types';
import { formatTime } from '../utils/formatters';
import { EmojiPickerComponent } from './EmojiPicker';
import { MessageActions } from './MessageActions';
import { MessageReactions } from './MessageReactions';
import { ReplyBar } from './ReplyBar';

type ChatMessage = Message;

interface ChatSectionProps {
    messages: ChatMessage[];
    newMessage: string;
    setNewMessage: (value: string) => void;
    handleSendMessage: (e: React.FormEvent, replyTo?: ReplyMessage | null) => void;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
    currentUser?: string;
}

export const ChatSection = ({
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    chatEndRef,
    currentUser
}: ChatSectionProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [replyingTo, setReplyingTo] = useState<ReplyMessage | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const { addReaction, removeReaction, getMessageReactions } = useReactions();
    const userMessages = messages.filter(message => message.type === 'text' || message.type === 'user');

    // Función para contar las respuestas que tiene un mensaje
    const getReplyCount = (messageId: string): number => {
        return userMessages.filter(message => message.replyTo?.id === messageId).length;
    };

    // Función para detectar si un mensaje tiene respuestas recientes (últimos 5 minutos)
    const hasRecentReplies = (messageId: string): boolean => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return userMessages.some(message => 
            message.replyTo?.id === messageId && 
            message.timestamp > fiveMinutesAgo
        );
    };

    const handleReply = (message: Message) => {
        setReplyingTo({
            id: message.id,
            sender: typeof message.sender === 'string' ? message.sender : message.sender?.username || 'Usuario',
            content: message.content,
            emoji: '🏰' // Emoji por defecto
        });
        inputRef.current?.focus();
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleReactionAdd = (messageId: string, emoji: string) => {
        if (currentUser) {
            addReaction(messageId, emoji, currentUser);
        }
    };

    const handleReactionRemove = (messageId: string, emoji: string) => {
        if (currentUser) {
            removeReaction(messageId, emoji, currentUser);
        }
    };

    return (
        <div className="chat-section">
            <div className="chat-header">
                <h2>Chat del Lobby</h2>
            </div>

            <div className="chat-messages">
                {userMessages.length === 0 ? (
                    <motion.p
                        className="no-messages"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        No hay mensajes aún. ¡Sé el primero en escribir!
                    </motion.p>
                ) : (
                    userMessages.map(message => {
                        const messageReactions = getMessageReactions(message.id);
                        
                        return (
                            <motion.div
                                key={message.id}
                                className={`chat-message ${message.replyTo ? 'message-with-reply' : ''} ${getReplyCount(message.id) > 0 ? 'has-replies' : ''} ${hasRecentReplies(message.id) ? 'recent-replies' : ''} ${getReplyCount(message.id) >= 10 ? 'popular-message' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                onMouseEnter={() => setHoveredMessageId(message.id)}
                                onMouseLeave={() => setHoveredMessageId(null)}
                            >
                                {/* Indicador de respuesta */}
                                {message.replyTo && (
                                    <div className="message-reply-indicator">
                                        ↩
                                    </div>
                                )}

                                {/* Línea conectora */}
                                {message.replyTo && (
                                    <div className="reply-connector"></div>
                                )}

                                {/* Mensaje al que se responde */}
                                {message.replyTo && (
                                    <div className="reply-preview-message">
                                        <div className="reply-preview-header">
                                            <span className="reply-icon">↩️</span>
                                            <span>Respondiendo a {message.replyTo.sender}</span>
                                            {message.replyTo.emoji && <span>{message.replyTo.emoji}</span>}
                                        </div>
                                        <div className="reply-preview-content">
                                            {message.replyTo.content.length > 60 
                                                ? `${message.replyTo.content.substring(0, 60)}...` 
                                                : message.replyTo.content
                                            }
                                        </div>
                                    </div>
                                )}

                                <div className="message-content-wrapper">
                                    <span className="message-sender">
                                        {typeof message.sender === 'string' ? message.sender : message.sender?.username || 'Usuario'}:
                                    </span>
                                    <span className="message-content">{message.content}</span>
                                    <div className="message-meta">
                                        <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                                        {/* Indicador de respuestas */}
                                        {getReplyCount(message.id) > 0 && (
                                            <div className="reply-count-indicator" title={`${getReplyCount(message.id)} respuesta${getReplyCount(message.id) > 1 ? 's' : ''}`}>
                                                <span className="reply-count-icon">💬</span>
                                                <span className="reply-count-number">{getReplyCount(message.id)}</span>
                                                {getReplyCount(message.id) >= 5 && (
                                                    <span className="reply-badge">🔥</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reacciones */}
                                {messageReactions.length > 0 && (
                                    <MessageReactions
                                        reactions={messageReactions}
                                        onReactionAdd={(emoji) => handleReactionAdd(message.id, emoji)}
                                        onReactionRemove={(emoji) => handleReactionRemove(message.id, emoji)}
                                        currentUser={currentUser || ''}
                                    />
                                )}

                                {/* Acciones del mensaje */}
                                <MessageActions
                                    isVisible={hoveredMessageId === message.id}
                                    onReply={() => handleReply(message)}
                                    onReact={() => handleReactionAdd(message.id, '👍')}
                                    onForward={() => console.log('Reenviar mensaje:', message.id)}
                                    onMore={() => console.log('Más opciones:', message.id)}
                                />
                            </motion.div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Barra de respuesta */}
            <ReplyBar
                replyingTo={replyingTo}
                onCancelReply={handleCancelReply}
            />

            <form onSubmit={(e) => {
                handleSendMessage(e, replyingTo);
                setReplyingTo(null); // Limpiar el estado de reply después de enviar
            }} className="chat-input-form">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={replyingTo ? `Responder a ${replyingTo.sender}...` : "Escribe un mensaje..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    className={`chat-input ${replyingTo ? 'replying' : ''}`}
                />
                <EmojiPickerComponent
                    onEmojiSelect={(emoji) => setNewMessage(newMessage + emoji)}
                    inputRef={inputRef}
                />
                <motion.button
                    type="submit"
                    className="send-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Enviar
                </motion.button>
            </form>
        </div>
    );
}; 