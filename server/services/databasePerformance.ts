import { Logger } from '../utils/logger.js';

interface QueryMetrics {
    query: string;
    executionTime: number;
    timestamp: Date;
    success: boolean;
    error?: string | undefined;
}

interface PerformanceStats {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    errorRate: number;
    cacheHitRate: number;
    cacheMisses: number;
}

export class DatabasePerformanceMonitor {
    private static instance: DatabasePerformanceMonitor;
    private queryMetrics: QueryMetrics[] = [];
    private cacheHits = 0;
    private cacheMisses = 0;
    private readonly MAX_METRICS = 1000; // Mantener solo los últimos 1000 queries
    private readonly SLOW_QUERY_THRESHOLD = 100; // 100ms

    private constructor() {}

    static getInstance(): DatabasePerformanceMonitor {
        if (!DatabasePerformanceMonitor.instance) {
            DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor();
        }
        return DatabasePerformanceMonitor.instance;
    }

    // Decorator para medir el tiempo de ejecución de queries
    static async measureQuery<T>(
        queryName: string,
        queryFn: () => Promise<T>
    ): Promise<T> {
        const monitor = DatabasePerformanceMonitor.getInstance();
        const startTime = Date.now();
        let success = false;
        let error: string | undefined;

        try {
            const result = await queryFn();
            success = true;
            return result;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error';
            throw err;
        } finally {
            const executionTime = Date.now() - startTime;
            monitor.recordQuery({
                query: queryName,
                executionTime,
                timestamp: new Date(),
                success,
                error
            });

            // Log queries lentos
            if (executionTime > monitor.SLOW_QUERY_THRESHOLD) {
                Logger.warn(`Query lenta detectada: ${queryName} - ${executionTime}ms`);
            }
        }
    }

    // Registrar métricas de cache
    recordCacheHit(): void {
        this.cacheHits++;
    }

    recordCacheMiss(): void {
        this.cacheMisses++;
    }

    // Registrar métrica de query
    private recordQuery(metric: QueryMetrics): void {
        this.queryMetrics.push(metric);

        // Mantener solo los últimos N métricas
        if (this.queryMetrics.length > this.MAX_METRICS) {
            this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
        }
    }

    // Obtener estadísticas de performance
    getPerformanceStats(): PerformanceStats {
        const totalQueries = this.queryMetrics.length;
        if (totalQueries === 0) {
            return {
                totalQueries: 0,
                averageExecutionTime: 0,
                slowQueries: 0,
                errorRate: 0,
                cacheHitRate: 0,
                cacheMisses: 0
            };
        }

        const successfulQueries = this.queryMetrics.filter(q => q.success);
        const failedQueries = this.queryMetrics.filter(q => !q.success);
        const slowQueries = this.queryMetrics.filter(q => q.executionTime > this.SLOW_QUERY_THRESHOLD);

        const totalExecutionTime = successfulQueries.reduce((sum, q) => sum + q.executionTime, 0);
        const averageExecutionTime = totalExecutionTime / successfulQueries.length;

        const totalCacheRequests = this.cacheHits + this.cacheMisses;
        const cacheHitRate = totalCacheRequests > 0 ? (this.cacheHits / totalCacheRequests) * 100 : 0;

        return {
            totalQueries,
            averageExecutionTime,
            slowQueries: slowQueries.length,
            errorRate: (failedQueries.length / totalQueries) * 100,
            cacheHitRate,
            cacheMisses: this.cacheMisses
        };
    }

    // Obtener queries más lentos
    getSlowestQueries(limit: number = 10): QueryMetrics[] {
        return this.queryMetrics
            .filter(q => q.success)
            .sort((a, b) => b.executionTime - a.executionTime)
            .slice(0, limit);
    }

    // Obtener queries con errores
    getFailedQueries(limit: number = 10): QueryMetrics[] {
        return this.queryMetrics
            .filter(q => !q.success)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    // Limpiar métricas antiguas (más de 24 horas)
    cleanupOldMetrics(): void {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.queryMetrics = this.queryMetrics.filter(
            metric => metric.timestamp > oneDayAgo
        );
    }

    // Resetear métricas
    resetMetrics(): void {
        this.queryMetrics = [];
        this.cacheHits = 0;
        this.cacheMisses = 0;
        Logger.database('Métricas de performance de base de datos reseteadas');
    }
}

// Instancia global
export const dbPerformanceMonitor = DatabasePerformanceMonitor.getInstance(); 