import { motion } from 'motion/react';
import { User } from '../types';
import { formatJoinDate, getAvatarInitial, getStatusColor, getStatusText } from '../utils/formatters';
import { VirtualizedUsersList } from './VirtualizedUsersList';

interface UsersListProps {
    users: User[];
    onUserContextMenu: (e: React.MouseEvent, user: User) => void;
    useVirtualization?: boolean;
    virtualizationThreshold?: number;
}

export const UsersList = ({ 
    users, 
    onUserContextMenu, 
    useVirtualization = true,
    virtualizationThreshold = 10 
}: UsersListProps) => {
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

    const renderUsersSection = (users: User[], title: string, icon: string) => {
        const shouldUseVirtualization = useVirtualization && users.length > virtualizationThreshold;
        
        return (
            <div className="users-section">
                <h3>{icon} {title} ({users.length})</h3>
                <div className="users-list">
                    {users.length === 0 ? (
                        <motion.p
                            className="no-users"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            No hay usuarios {title.toLowerCase()}
                        </motion.p>
                    ) : shouldUseVirtualization ? (
                        <VirtualizedUsersList
                            users={users}
                            onUserContextMenu={onUserContextMenu}
                            height={Math.min(users.length * 80, 400)}
                            itemHeight={80}
                        />
                    ) : (
                        users.map(renderUserCard)
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="users-container">
            {renderUsersSection(onlineUsers, 'USUARIOS EN LÍNEA', '👥')}
            {renderUsersSection(awayUsers, 'USUARIOS AUSENTES', '😴')}
        </div>
    );
}; 