import { motion } from 'motion/react';
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { User } from '../types';
import { formatJoinDate, getAvatarInitial, getStatusColor, getStatusText } from '../utils/formatters';

interface VirtualizedUsersListProps {
    users: User[];
    onUserContextMenu: (e: React.MouseEvent, user: User) => void;
    height?: number;
    itemHeight?: number;
}

interface RowProps {
    index: number;
    style: React.CSSProperties;
    data: {
        users: User[];
        onUserContextMenu: (e: React.MouseEvent, user: User) => void;
    };
}

const UserCard: React.FC<{ user: User; onUserContextMenu: (e: React.MouseEvent, user: User) => void }> = ({ 
    user, 
    onUserContextMenu 
}) => (
    <motion.div
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

const Row: React.FC<RowProps> = ({ index, style, data }) => {
    const user = data.users[index];
    if (!user) return null;
    
    return (
        <div style={style}>
            <UserCard user={user} onUserContextMenu={data.onUserContextMenu} />
        </div>
    );
};

export const VirtualizedUsersList: React.FC<VirtualizedUsersListProps> = ({
    users,
    onUserContextMenu,
    height = 400,
    itemHeight = 80
}) => {
    if (users.length === 0) {
        return (
            <motion.p
                className="no-users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                No hay usuarios
            </motion.p>
        );
    }

    // Calcular altura dinámica basada en el número de usuarios
    const dynamicHeight = Math.min(users.length * itemHeight, height);
    
    return (
        <div className="virtualized-list-container">
            <List
                height={dynamicHeight}
                itemCount={users.length}
                itemSize={itemHeight}
                itemData={{ users, onUserContextMenu }}
                width="100%"
                overscanCount={5}
                className="virtualized-list"
            >
                {Row}
            </List>
        </div>
    );
}; 