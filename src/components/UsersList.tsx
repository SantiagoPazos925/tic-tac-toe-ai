import { motion } from 'motion/react';
import { User } from '../types';
import { formatTime, getStatusColor, getStatusText, getAvatarInitial } from '../utils/formatters';

interface UsersListProps {
    users: User[];
    onUserContextMenu: (e: React.MouseEvent, user: User) => void;
}

export const UsersList = ({ users, onUserContextMenu }: UsersListProps) => {
    return (
        <div className="users-section">
            <h3>👥 USUARIOS EN LÍNEA ({users.length})</h3>
            <div className="users-list">
                {users.length === 0 ? (
                    <motion.p
                        className="no-users"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        No hay usuarios en línea
                    </motion.p>
                ) : (
                    users.map(user => (
                        <motion.div
                            key={user.id}
                            className="user-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            onContextMenu={(e) => onUserContextMenu(e, user)}
                        >
                            <div className="user-avatar">
                                {getAvatarInitial(user.name)}
                            </div>
                            <div className="user-details">
                                <h4>{user.name}</h4>
                                <span
                                    className="user-status"
                                    style={{ color: getStatusColor(user.status) }}
                                >
                                    {getStatusText(user.status)}
                                </span>
                            </div>
                            <div className="user-time">
                                Desde {formatTime(user.joinedAt)}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}; 