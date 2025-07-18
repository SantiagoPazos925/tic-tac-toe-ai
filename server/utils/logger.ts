import { serverConfig } from '../config/index.js';

// Niveles de log
export enum LogLevel {
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG'
}

// Colores para consola
const colors = {
    ERROR: '\x1b[31m', // Rojo
    WARN: '\x1b[33m',  // Amarillo
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[35m', // Magenta
    RESET: '\x1b[0m'   // Reset
};

// Clase Logger
export class Logger {
    private static getTimestamp(): string {
        return new Date().toISOString();
    }

    private static formatMessage(level: LogLevel, message: string, data?: any): string {
        const timestamp = this.getTimestamp();
        const color = colors[level];
        const reset = colors.RESET;

        let formattedMessage = `${color}[${level}]${reset} ${timestamp} - ${message}`;

        if (data) {
            formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
        }

        return formattedMessage;
    }

    static error(message: string, data?: any): void {
        console.error(this.formatMessage(LogLevel.ERROR, message, data));
    }

    static warn(message: string, data?: any): void {
        console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }

    static info(message: string, data?: any): void {
        console.info(this.formatMessage(LogLevel.INFO, message, data));
    }

    static debug(message: string, data?: any): void {
        if (serverConfig.environment === 'development') {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
        }
    }

    // Logs específicos para diferentes partes del sistema
    static auth(message: string, data?: any): void {
        this.info(`[AUTH] ${message}`, data);
    }

    static lobby(message: string, data?: any): void {
        this.info(`[LOBBY] ${message}`, data);
    }

    static database(message: string, data?: any): void {
        this.info(`[DB] ${message}`, data);
    }

    static socket(message: string, data?: any): void {
        this.debug(`[SOCKET] ${message}`, data);
    }
} 