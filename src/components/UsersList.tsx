import { motion } from 'motion/react';
import { User } from '../types';
import { formatJoinDate, getAvatarInitial, getStatusColor, getStatusText } from '../utils/formatters';

interface UsersListProps {
    users: User[];
    onUserContextMenu: (e: React.MouseEvent, user: User) => void;
}

export const UsersList = ({ users, onUserContextMenu }: UsersListProps) => {
    // Separar usuarios por estado
    const onlineUsers = users.filter(user => user.status === 'online');
    const awayUsers = users.filter(user => user.status === 'away');

    const renderUserCard = (user: User) => (
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
                    {getAvatarInitial(user.username || user.name)}
                </div>
                <div className="user-details">
                    <h4>{user.username || user.name || 'Usuario'}</h4>
                    <span
                        className="user-status"
                        style={{ color: getStatusColor(user.status) }}
                    >
                        {getStatusText(user.status)}
                    </span>
                </div>
                <div className="user-time">
                    {formatJoinDate(user.joinDate)}
                </div>
            </motion.div>
        );

    return (
        <div className="users-container">
            {/* Sección de usuarios en línea */}
            <div className="users-section">
                <h3>👥 USUARIOS EN LÍNEA ({onlineUsers.length})</h3>
                <div className="users-list">
                    {onlineUsers.length === 0 ? (
                        <motion.p
                            className="no-users"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            No hay usuarios en línea
                        </motion.p>
                    ) : (
                        onlineUsers.map(renderUserCard)
                    )}
                </div>
            </div>

            {/* Sección de usuarios ausentes */}
            <div className="users-section">
                <h3>😴 USUARIOS AUSENTES ({awayUsers.length})</h3>
                <div className="users-list">
                    {awayUsers.length === 0 ? (
                        <motion.p
                            className="no-users"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            No hay usuarios ausentes
                        </motion.p>
                    ) : (
                        awayUsers.map(renderUserCard)
                    )}
                </div>
            </div>
        </div>
    );
}; 