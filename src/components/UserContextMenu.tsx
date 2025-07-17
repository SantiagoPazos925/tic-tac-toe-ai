import { motion } from 'motion/react';
import { User, ContextMenuPosition } from '../types';
import { getStatusColor, getStatusText, getAvatarInitial } from '../utils/formatters';

interface UserContextMenuProps {
    contextMenuUser: User;
    contextMenuPosition: ContextMenuPosition;
    onUserAction: (action: string) => void;
    onClose: () => void;
}

export const UserContextMenu = ({
    contextMenuUser,
    contextMenuPosition,
    onUserAction,
    onClose
}: UserContextMenuProps) => {
    return (
        <motion.div
            className="user-context-menu"
            style={{
                left: contextMenuPosition.x,
                top: contextMenuPosition.y
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
        >
            <div className="context-menu-header">
                <div className="context-user-avatar">
                    {getAvatarInitial(contextMenuUser.name)}
                </div>
                <div className="context-user-info">
                    <h4>{contextMenuUser.name}</h4>
                    <span
                        className="context-user-status"
                        style={{ color: getStatusColor(contextMenuUser.status) }}
                    >
                        {getStatusText(contextMenuUser.status)}
                    </span>
                </div>
            </div>

            <div className="context-menu-options">
                <motion.button
                    onClick={() => onUserAction('profile')}
                    className="context-option"
                    whileHover={{ backgroundColor: 'var(--discord-hover)' }}
                >
                    <span>👤</span>
                    <span>Ver Perfil</span>
                </motion.button>
                <motion.button
                    onClick={() => onUserAction('message')}
                    className="context-option"
                    whileHover={{ backgroundColor: 'var(--discord-hover)' }}
                >
                    <span>💬</span>
                    <span>Enviar Mensaje</span>
                </motion.button>
                <motion.button
                    onClick={() => onUserAction('invite')}
                    className="context-option"
                    whileHover={{ backgroundColor: 'var(--discord-hover)' }}
                >
                    <span>🎮</span>
                    <span>Invitar a Jugar</span>
                </motion.button>
                <motion.button
                    onClick={() => onUserAction('block')}
                    className="context-option danger"
                    whileHover={{ backgroundColor: 'var(--discord-danger)' }}
                >
                    <span>🚫</span>
                    <span>Bloquear Usuario</span>
                </motion.button>
            </div>
        </motion.div>
    );
}; 