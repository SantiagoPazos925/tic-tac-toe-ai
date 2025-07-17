import { motion } from 'motion/react';
import { ChatMessage } from '../types';
import { formatTime } from '../utils/formatters';

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
    const userMessages = messages.filter(message => message.type === 'user');

    return (
        <div className="chat-section">
            <div className="chat-header">
                <h2>💬 Chat del Lobby</h2>
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
                            <span className="message-sender">{message.sender}: </span>
                            <span className="message-content">{message.content}</span>
                            <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                        </motion.div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    className="chat-input"
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