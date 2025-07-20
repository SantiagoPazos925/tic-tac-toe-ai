import { motion } from 'motion/react';
import { Message } from '../types';
import { formatTime } from '../utils/formatters';

type ChatMessage = Message;

interface SystemMessagesProps {
    messages: ChatMessage[];
    systemMessagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const SystemMessages = ({ messages, systemMessagesEndRef }: SystemMessagesProps) => {
    const systemMessages = messages.filter(message => message.type === 'system');

    if (systemMessages.length === 0) return null;

    return (
        <div className="system-messages-section">
            <div className="system-messages">
                <h4 className="system-messages-title">Información del Sistema</h4>
                {systemMessages.map(message => (
                    <motion.div
                        key={message.id}
                        className="system-message"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="system-icon">ℹ️</span>
                        <span className="system-content">{message.content}</span>
                        <span className="system-timestamp">{formatTime(message.timestamp)}</span>
                    </motion.div>
                ))}
                <div ref={systemMessagesEndRef} />
            </div>
        </div>
    );
}; 