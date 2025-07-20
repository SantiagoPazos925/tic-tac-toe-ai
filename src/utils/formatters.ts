// Formatear tiempo
export const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
    }
    
    return dateObj.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Obtener color del estado
export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'online': return '#10b981';
        case 'away': return '#f59e0b';
        case 'offline': return '#6b7280';
        default: return '#6b7280';
    }
};

// Obtener texto del estado
export const getStatusText = (status: string): string => {
    switch (status) {
        case 'online': return 'En línea';
        case 'away': return 'Ausente';
        case 'offline': return 'Desconectado';
        default: return 'Desconocido';
    }
};

// Formatear nombre para avatar
export const getAvatarInitial = (name: string | undefined | null): string => {
    if (!name || name.trim() === '') {
        return '?';
    }
    return name.charAt(0).toUpperCase();
};

// Formatear ping
export const formatPing = (ping: number): string => {
    return `${ping}ms`;
};

// Formatear fecha de conexión
export const formatJoinDate = (date: Date | string | undefined): string => {
    if (!date) {
        return 'Fecha no disponible';
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
    }
    
    return dateObj.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Validar email
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar username
export const isValidUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 20;
};

// Validar password
export const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
}; 