import { motion } from 'motion/react';
import React, { useState } from 'react';
import { User } from '../types';
import { VirtualizedUsersList } from './VirtualizedUsersList';

interface VirtualizationDemoProps {
    onUserContextMenu: (e: React.MouseEvent, user: User) => void;
}

// Función para generar usuarios de prueba
const generateMockUsers = (count: number): User[] => {
    const statuses: ('online' | 'away')[] = ['online', 'away'];
    const names = [
        'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
        'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul',
        'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander',
        'Yara', 'Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley'
    ];

    return Array.from({ length: count }, (_, index) => {
        const nameIndex = index % names.length;
        const status = statuses[index % statuses.length] || 'online';
        const name = names[nameIndex] || 'Usuario';
        
        return {
            id: `user-${index}`,
            username: name + (index > names.length ? ` ${Math.floor(index / names.length) + 1}` : ''),
            email: `${name.toLowerCase()}@example.com`,
            status: status,
            lastSeen: new Date(Date.now() - Math.random() * 86400000), // Últimas 24 horas
            isOnline: status === 'online',
            joinDate: new Date(Date.now() - Math.random() * 604800000), // Última semana
            name: name + (index > names.length ? ` ${Math.floor(index / names.length) + 1}` : '')
        };
    });
};

export const VirtualizationDemo: React.FC<VirtualizationDemoProps> = ({ onUserContextMenu }) => {
    const [userCount, setUserCount] = useState(50);
    const [useVirtualization, setUseVirtualization] = useState(true);
    const [showDemo, setShowDemo] = useState(false);

    const mockUsers = generateMockUsers(userCount);
    const onlineUsers = mockUsers.filter(user => user.status === 'online');
    const awayUsers = mockUsers.filter(user => user.status === 'away');

    return (
        <div className="virtualization-demo">
            <motion.div
                className="demo-controls"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h3>🚀 Demo de Virtualización</h3>
                <div className="controls-grid">
                    <div className="control-group">
                        <label htmlFor="userCount">Número de usuarios:</label>
                        <input
                            id="userCount"
                            type="range"
                            min="10"
                            max="1000"
                            step="10"
                            value={userCount}
                            onChange={(e) => setUserCount(parseInt(e.target.value))}
                        />
                        <span>{userCount} usuarios</span>
                    </div>
                    
                    <div className="control-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={useVirtualization}
                                onChange={(e) => setUseVirtualization(e.target.checked)}
                            />
                            Usar virtualización
                        </label>
                    </div>
                    
                    <button
                        className="demo-toggle-btn"
                        onClick={() => setShowDemo(!showDemo)}
                    >
                        {showDemo ? 'Ocultar Demo' : 'Mostrar Demo'}
                    </button>
                </div>
                
                <div className="demo-stats">
                    <p>👥 En línea: {onlineUsers.length}</p>
                    <p>😴 Ausentes: {awayUsers.length}</p>
                    <p>⚡ Rendimiento: {useVirtualization ? 'Optimizado' : 'Normal'}</p>
                </div>
            </motion.div>

            {showDemo && (
                <motion.div
                    className="demo-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <VirtualizedUsersList
                        users={mockUsers}
                        onUserContextMenu={onUserContextMenu}
                        height={400}
                        itemHeight={80}
                    />
                </motion.div>
            )}
        </div>
    );
}; 