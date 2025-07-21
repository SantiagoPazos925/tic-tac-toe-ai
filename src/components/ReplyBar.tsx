import { motion } from 'motion/react';

interface ReplyBarProps {
    replyingTo: {
        id: string;
        sender: string;
        content: string;
        emoji?: string;
    } | null;
    onCancelReply: () => void;
}

export const ReplyBar = ({ replyingTo, onCancelReply }: ReplyBarProps) => {
    if (!replyingTo) return null;

    return (
        <motion.div
            className="reply-bar"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="reply-content">
                <div className="reply-indicator">
                    <span className="reply-icon">↩️</span>
                    <span className="reply-text">Respondiendo a <strong>{replyingTo.sender}</strong></span>
                    {replyingTo.emoji && (
                        <span className="reply-emoji">{replyingTo.emoji}</span>
                    )}
                </div>
                <div className="reply-preview">
                    <span className="reply-preview-text">
                        {replyingTo.content.length > 50 
                            ? `${replyingTo.content.substring(0, 50)}...` 
                            : replyingTo.content
                        }
                    </span>
                </div>
            </div>
            <div className="reply-actions">
                <span className="reply-status">@ ACTIVADO</span>
                <button
                    className="cancel-reply-btn"
                    onClick={onCancelReply}
                    title="Cancelar respuesta"
                >
                    ✕
                </button>
            </div>
        </motion.div>
    );
}; 