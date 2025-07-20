import { motion } from 'motion/react';
import React, { useRef } from 'react';
import { Message } from '../types';
import { formatTime } from '../utils/formatters';
import { EmojiPickerComponent } from './EmojiPicker';

type ChatMessage = Message;

interface ChatSectionProps {
    messages: ChatMessage[];
    newMessage: string;
    setNewMessage: (value: string) => void;
    handleSendMessage: (e: React.FormEvent) => void;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatSection = ({
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    chatEndRef
}: ChatSectionProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const userMessages = messages.filter(message => message.type === 'text' || message.type === 'user');

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
                    userMessages.map(message => (
                        <motion.div
                            key={message.id}
                            className="chat-message"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="message-sender">{typeof message.sender === 'string' ? message.sender : message.sender?.username || 'Usuario'}: </span>
                            <span className="message-content">{message.content}</span>
                            <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                        </motion.div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    className="chat-input"
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