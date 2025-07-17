import { motion } from 'motion/react';
import { User, AuthUser } from '../types';
import { getStatusColor, getStatusText, getAvatarInitial } from '../utils/formatters';

interface UserProfileProps {
    authUser: AuthUser | null;
    currentUser: User | null;
    showStatusMenu: boolean;
    toggleStatusMenu: () => void;
    onStatusChange: (status: 'online' | 'away') => void;
    onLogout: () => void;
}

export const UserProfile = ({
    authUser,
    currentUser,
    showStatusMenu,
    toggleStatusMenu,
    onStatusChange,
    onLogout
}: UserProfileProps) => {
    return (
        <div className="user-profile-section">
            <div className="user-profile">
                <div className="profile-header" onClick={toggleStatusMenu}>
                    <div className="profile-avatar">
                        {authUser ? getAvatarInitial(authUser.username) : ''}
                    </div>
                    <div className="profile-info">
                        <h3>{authUser?.username}</h3>
                        <span
                            className="current-status"
                            style={{ color: currentUser ? getStatusColor(currentUser.status) : '#10b981' }}
                        >
                            {currentUser ? getStatusText(currentUser.status) : 'En línea'}
                        </span>
                    </div>
                    <motion.button
                        className="status-toggle-button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ⚙️
                    </motion.button>
                </div>

                {showStatusMenu && (
                    <motion.div
                        className="status-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="status-options">
                            <motion.button
                                onClick={() => onStatusChange('online')}
                                className="status-option online"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="status-dot online"></span>
                                <span>En línea</span>
                            </motion.button>
                            <motion.button
                                onClick={() => onStatusChange('away')}
                                className="status-option away"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="status-dot away"></span>
                                <span>Ausente</span>
                            </motion.button>
                            <motion.button
                                onClick={onLogout}
                                className="status-option logout-option"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>🚪</span>
                                <span>Cerrar Sesión</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}; 