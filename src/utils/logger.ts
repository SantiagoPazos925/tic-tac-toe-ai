// Sistema de logging centralizado
class Logger {
    private static isDevelopment = import.meta.env.DEV;

    static info(message: string, ...args: any[]) {
        if (this.isDevelopment) {
            console.log(`ℹ️ ${message}`, ...args);
        }
    }

    static debug(message: string, ...args: any[]) {
        if (this.isDevelopment) {
            console.log(`🔍 DEBUG: ${message}`, ...args);
        }
    }

    static warn(message: string, ...args: any[]) {
        if (this.isDevelopment) {
            console.warn(`⚠️ ${message}`, ...args);
        }
    }

    static error(message: string, ...args: any[]) {
        console.error(`❌ ${message}`, ...args);
    }

    static socket(message: string, ...args: any[]) {
        if (this.isDevelopment) {
            console.log(`🔌 SOCKET: ${message}`, ...args);
        }
    }

    static auth(message: string, ...args: any[]) {
        if (this.isDevelopment) {
            console.log(`🔐 AUTH: ${message}`, ...args);
        }
    }

    static performance(message: string, ...args: any[]) {
        if (this.isDevelopment) {
            console.log(`⚡ PERF: ${message}`, ...args);
        }
    }
}

export default Logger; 