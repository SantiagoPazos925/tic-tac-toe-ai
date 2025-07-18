import React from 'react';
import { motion } from 'motion/react';

interface MobileNavigationProps {
    onToggleUsers: () => void;
    onToggleChannels: () => void;
    showUsers: boolean;
    showChannels: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
    onToggleUsers,
    onToggleChannels,
    showUsers,
    showChannels
}) => {
    return (
        <div className="mobile-navigation">
            <motion.button
                className={`mobile-nav-button ${showChannels ? 'active' : ''}`}
                onClick={onToggleChannels}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Canales"
            >
                📋
            </motion.button>

            <motion.button
                className={`mobile-nav-button ${showUsers ? 'active' : ''}`}
                onClick={onToggleUsers}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Usuarios"
            >
                👥
            </motion.button>
        </div>
    );
}; 