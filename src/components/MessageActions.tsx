import { AnimatePresence, motion } from 'motion/react';

interface MessageActionsProps {
    isVisible: boolean;
    onReply: () => void;
    onReact: () => void;
    onForward?: () => void;
    onMore?: () => void;
}

export const MessageActions = ({ 
    isVisible, 
    onReply, 
    onReact, 
    onForward, 
    onMore 
}: MessageActionsProps) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="message-actions"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Reacciones rápidas */}
                    <div className="quick-reactions">
                        <button
                            className="reaction-quick-btn"
                            onClick={onReact}
                            title="👻 Fantasma"
                        >
                            👻
                        </button>
                        <button
                            className="reaction-quick-btn"
                            onClick={onReact}
                            title="🙏 Rezar"
                        >
                            🙏
                        </button>
                        <button
                            className="reaction-quick-btn"
                            onClick={onReact}
                            title="👍 Me gusta"
                        >
                            👍
                        </button>
                        <button
                            className="reaction-quick-btn"
                            onClick={onReact}
                            title="😊 Sonrisa"
                        >
                            😊
                        </button>
                    </div>

                    {/* Acciones del mensaje */}
                    <div className="message-action-buttons">
                        <button
                            className="action-btn reply-btn"
                            onClick={onReply}
                            title="Responder"
                        >
                            <span className="action-icon">↩️</span>
                        </button>
                        
                        {onForward && (
                            <button
                                className="action-btn forward-btn"
                                onClick={onForward}
                                title="Reenviar"
                            >
                                <span className="action-icon">↪️</span>
                            </button>
                        )}
                        
                        {onMore && (
                            <button
                                className="action-btn more-btn"
                                onClick={onMore}
                                title="Más opciones"
                            >
                                <span className="action-icon">⋯</span>
                            </button>
                        )}
                    </div>

                    {/* Botón de responder destacado */}
                    <button
                        className="reply-highlight-btn"
                        onClick={onReply}
                    >
                        Responder
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 