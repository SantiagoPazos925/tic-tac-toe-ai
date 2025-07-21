import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { formatJoinDate, getAvatarInitial, getStatusColor, getStatusText } from '../utils/formatters';
import { VirtualizedUsersList } from './VirtualizedUsersList';

interface UsersListProps {
    users: User[];
    onUserContextMenu: (e: React.MouseEvent, user: User) => void;
    useVirtualization?: boolean;
    virtualizationThreshold?: number;
    onStatusChange?: (status: string) => void;
    onLogout?: () => void;
    currentUser?: User | null;
}

export const UsersList = ({ 
    users, 
    onUserContextMenu, 
    useVirtualization = true,
    virtualizationThreshold = 10,
    onStatusChange,
    onLogout,
    currentUser
}: UsersListProps) => {
    const [showStatusPopup, setShowStatusPopup] = useState(false);
    
    // Separar usuarios por estado
    const onlineUsers = users.filter(user => user.status === 'online');
    const awayUsers = users.filter(user => user.status === 'away');

    // Cerrar popup al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.user-profile-section-integrated')) {
                setShowStatusPopup(false);
            }
        };

        if (showStatusPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showStatusPopup]);

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
            
            {/* Sección de perfil de usuario integrada */}
            {currentUser && (
                <div className="user-profile-section-integrated">
                    <div 
                        className="user-profile-info-clickable"
                        onClick={() => setShowStatusPopup(!showStatusPopup)}
                    >
                        <div className="profile-avatar">
                            {getAvatarInitial(currentUser.username || currentUser.name)}
                        </div>
                        <div className="profile-details">
                            <h4>{currentUser.username || currentUser.name || 'Usuario'}</h4>
                            <span className="profile-status">
                                {getStatusText(currentUser.status)}
                            </span>
                        </div>
                        <div className="profile-actions">
                            <span className="status-indicator" style={{ color: getStatusColor(currentUser.status) }}>
                                ▼
                            </span>
                        </div>
                    </div>
                    
                    {/* Popup de cambio de estado */}
                    <AnimatePresence>
                        {showStatusPopup && (
                            <motion.div 
                                className="status-popup"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="popup-header">
                                    <h4>Cambiar estado</h4>
                                </div>
                                <div className="status-options">
                                    {onStatusChange && (
                                        <>
                                            <button 
                                                className={`status-option ${currentUser.status === 'online' ? 'active' : ''}`}
                                                onClick={() => {
                                                    onStatusChange('online');
                                                    setShowStatusPopup(false);
                                                }}
                                            >
                                                <div className="status-dot online"></div>
                                                <span>En línea</span>
                                            </button>
                                            <button 
                                                className={`status-option ${currentUser.status === 'away' ? 'active' : ''}`}
                                                onClick={() => {
                                                    onStatusChange('away');
                                                    setShowStatusPopup(false);
                                                }}
                                            >
                                                <div className="status-dot away"></div>
                                                <span>Ausente</span>
                                            </button>
                                        </>
                                    )}
                                    {onLogout && (
                                        <button 
                                            className="logout-option"
                                            onClick={() => {
                                                onLogout();
                                                setShowStatusPopup(false);
                                            }}
                                        >
                                            <span>🚪</span>
                                            <span>Cerrar sesión</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}; 