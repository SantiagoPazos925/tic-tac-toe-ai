// Utilidades para monitorear el rendimiento
export class PerformanceMonitor {
    private static metrics: Map<string, number[]> = new Map();
    private static marks: Map<string, number> = new Map();

    // Marcar el inicio de una operación
    static startTimer(name: string): void {
        this.marks.set(name, performance.now());
    }

    // Finalizar y medir una operación
    static endTimer(name: string): number {
        const startTime = this.marks.get(name);
        if (!startTime) {
            console.warn(`Timer '${name}' no encontrado`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(name);

        // Guardar métrica
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(duration);

        // Log en desarrollo
        if (import.meta.env.DEV) {
            console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    // Obtener estadísticas de una métrica
    static getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) return null;

        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return { avg, min, max, count: values.length };
    }

    // Limpiar métricas antiguas
    static cleanup(): void {
        this.metrics.clear();
        this.marks.clear();
    }

    // Medir el tiempo de renderizado de un componente
    static measureRender(componentName: string, callback: () => void): void {
        this.startTimer(`render-${componentName}`);
        callback();
        this.endTimer(`render-${componentName}`);
    }
}

// Hook para medir el rendimiento de componentes
export const usePerformance = (componentName: string) => {
    const startRender = () => {
        PerformanceMonitor.startTimer(`render-${componentName}`);
    };

    const endRender = () => {
        PerformanceMonitor.endTimer(`render-${componentName}`);
    };

    return { startRender, endRender };
};

// Utilidad para debounce
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Utilidad para throttle
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// Utilidad para memoización de funciones costosas
export const memoize = <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
): T => {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = func(...args);
        cache.set(key, result);
        return result;
    }) as T;
}; 