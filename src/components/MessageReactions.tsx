import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

interface Reaction {
    emoji: string;
    count: number;
    users: string[];
}

interface MessageReactionsProps {
    reactions: Reaction[];
    onReactionAdd: (emoji: string) => void;
    onReactionRemove: (emoji: string) => void;
    currentUser: string;
}

const QUICK_REACTIONS = ['👻', '🙏', '👍', '😊'];

export const MessageReactions = ({ 
    reactions, 
    onReactionAdd, 
    onReactionRemove, 
    currentUser 
}: MessageReactionsProps) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const handleReactionClick = (emoji: string) => {
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction && existingReaction.users.includes(currentUser)) {
            onReactionRemove(emoji);
        } else {
            onReactionAdd(emoji);
        }
        setShowReactionPicker(false);
    };

    const hasUserReacted = (emoji: string) => {
        const reaction = reactions.find(r => r.emoji === emoji);
        return reaction?.users.includes(currentUser) || false;
    };

    return (
        <div className="message-reactions">
            {/* Reacciones existentes */}
            <div className="reactions-list">
                {reactions.map((reaction, index) => (
                    <motion.button
                        key={`${reaction.emoji}-${index}`}
                        className={`reaction-item ${hasUserReacted(reaction.emoji) ? 'user-reacted' : ''}`}
                        onClick={() => handleReactionClick(reaction.emoji)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="reaction-emoji">{reaction.emoji}</span>
                        <span className="reaction-count">{reaction.count}</span>
                    </motion.button>
                ))}
            </div>

            {/* Botón para agregar reacción */}
            <div className="reaction-actions">
                <button
                    className="add-reaction-btn"
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    title="Agregar reacción"
                >
                    <span className="add-reaction-icon">+</span>
                </button>

                {/* Selector de reacciones rápidas */}
                <AnimatePresence>
                    {showReactionPicker && (
                        <motion.div
                            className="quick-reactions-picker"
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {QUICK_REACTIONS.map((emoji, index) => (
                                <motion.button
                                    key={emoji}
                                    className="quick-reaction-btn"
                                    onClick={() => handleReactionClick(emoji)}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}; 