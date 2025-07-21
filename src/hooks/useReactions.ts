import { useState, useCallback } from 'react';
import { Reaction } from '../types';

export const useReactions = () => {
    const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});

    const addReaction = useCallback((messageId: string, emoji: string, userId: string) => {
        setReactions(prev => {
            const messageReactions = prev[messageId] || [];
            const existingReaction = messageReactions.find(r => r.emoji === emoji);
            
            if (existingReaction) {
                // Si el usuario ya reaccionó, no hacer nada
                if (existingReaction.users.includes(userId)) {
                    return prev;
                }
                
                // Agregar usuario a la reacción existente
                const updatedReactions = messageReactions.map(r => 
                    r.emoji === emoji 
                        ? { ...r, users: [...r.users, userId], count: r.count + 1 }
                        : r
                );
                
                return {
                    ...prev,
                    [messageId]: updatedReactions
                };
            } else {
                // Crear nueva reacción
                const newReaction: Reaction = {
                    emoji,
                    users: [userId],
                    count: 1
                };
                
                return {
                    ...prev,
                    [messageId]: [...messageReactions, newReaction]
                };
            }
        });
    }, []);

    const removeReaction = useCallback((messageId: string, emoji: string, userId: string) => {
        setReactions(prev => {
            const messageReactions = prev[messageId] || [];
            const existingReaction = messageReactions.find(r => r.emoji === emoji);
            
            if (!existingReaction || !existingReaction.users.includes(userId)) {
                return prev;
            }
            
            const updatedReactions = messageReactions.map(r => {
                if (r.emoji === emoji) {
                    const newUsers = r.users.filter(u => u !== userId);
                    const newCount = r.count - 1;
                    
                    // Si no quedan usuarios, eliminar la reacción
                    if (newCount === 0) {
                        return null;
                    }
                    
                    return {
                        ...r,
                        users: newUsers,
                        count: newCount
                    };
                }
                return r;
            }).filter(Boolean) as Reaction[];
            
            return {
                ...prev,
                [messageId]: updatedReactions
            };
        });
    }, []);

    const getMessageReactions = useCallback((messageId: string): Reaction[] => {
        return reactions[messageId] || [];
    }, [reactions]);

    const hasUserReacted = useCallback((messageId: string, emoji: string, userId: string): boolean => {
        const messageReactions = reactions[messageId] || [];
        const reaction = messageReactions.find(r => r.emoji === emoji);
        return reaction?.users.includes(userId) || false;
    }, [reactions]);

    return {
        addReaction,
        removeReaction,
        getMessageReactions,
        hasUserReacted
    };
}; 