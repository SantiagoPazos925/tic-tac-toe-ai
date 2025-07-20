// Servicio para manejo de almacenamiento offline con IndexedDB
import Logger from '../utils/logger';

interface OfflineMessage {
    id: string;
    content: string;
    timestamp: number;
    userId: string;
    type: 'user' | 'system';
    synced: boolean;
}

interface OfflineUser {
    id: string;
    name: string;
    status: 'online' | 'away' | 'offline';
    lastSeen: number;
}

class OfflineStorageService {
    private dbName = 'TicTacToeOfflineDB';
    private version = 1;
    private db: IDBDatabase | null = null;

    // Inicializar la base de datos
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                Logger.error('Error abriendo IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                Logger.info('IndexedDB inicializada correctamente');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Crear store para mensajes offline
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
                    messageStore.createIndex('timestamp', 'timestamp', { unique: false });
                    messageStore.createIndex('synced', 'synced', { unique: false });
                    messageStore.createIndex('userId', 'userId', { unique: false });
                }

                // Crear store para usuarios offline
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('name', 'name', { unique: false });
                    userStore.createIndex('status', 'status', { unique: false });
                }

                // Crear store para configuración offline
                if (!db.objectStoreNames.contains('config')) {
                    db.createObjectStore('config', { keyPath: 'key' });
                }

                Logger.info('IndexedDB actualizada a versión', this.version);
            };
        });
    }

    // Guardar mensaje offline
    async saveMessage(message: Omit<OfflineMessage, 'id' | 'synced'>): Promise<string> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const offlineMessage: OfflineMessage = {
            ...message,
            id,
            synced: false
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const request = store.add(offlineMessage);

            request.onsuccess = () => {
                Logger.info('Mensaje guardado offline:', id);
                resolve(id);
            };

            request.onerror = () => {
                Logger.error('Error guardando mensaje offline:', request.error);
                reject(request.error);
            };
        });
    }

    // Obtener mensajes no sincronizados
    async getUnsyncedMessages(): Promise<OfflineMessage[]> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const index = store.index('synced');
            const request = index.getAll(IDBKeyRange.only(false));

            request.onsuccess = () => {
                const messages = request.result as OfflineMessage[];
                Logger.info('Mensajes no sincronizados obtenidos:', messages.length);
                resolve(messages);
            };

            request.onerror = () => {
                Logger.error('Error obteniendo mensajes no sincronizados:', request.error);
                reject(request.error);
            };
        });
    }

    // Marcar mensaje como sincronizado
    async markMessageAsSynced(messageId: string): Promise<void> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const getRequest = store.get(messageId);

            getRequest.onsuccess = () => {
                const message = getRequest.result as OfflineMessage;
                if (message) {
                    message.synced = true;
                    const putRequest = store.put(message);

                    putRequest.onsuccess = () => {
                        Logger.info('Mensaje marcado como sincronizado:', messageId);
                        resolve();
                    };

                    putRequest.onerror = () => {
                        Logger.error('Error marcando mensaje como sincronizado:', putRequest.error);
                        reject(putRequest.error);
                    };
                } else {
                    resolve();
                }
            };

            getRequest.onerror = () => {
                Logger.error('Error obteniendo mensaje para marcar como sincronizado:', getRequest.error);
                reject(getRequest.error);
            };
        });
    }

    // Guardar usuario offline
    async saveUser(user: OfflineUser): Promise<void> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.put(user);

            request.onsuccess = () => {
                Logger.info('Usuario guardado offline:', user.id);
                resolve();
            };

            request.onerror = () => {
                Logger.error('Error guardando usuario offline:', request.error);
                reject(request.error);
            };
        });
    }

    // Obtener todos los usuarios offline
    async getUsers(): Promise<OfflineUser[]> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();

            request.onsuccess = () => {
                const users = request.result as OfflineUser[];
                Logger.info('Usuarios offline obtenidos:', users.length);
                resolve(users);
            };

            request.onerror = () => {
                Logger.error('Error obteniendo usuarios offline:', request.error);
                reject(request.error);
            };
        });
    }

    // Guardar configuración
    async saveConfig(key: string, value: any): Promise<void> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['config'], 'readwrite');
            const store = transaction.objectStore('config');
            const request = store.put({ key, value });

            request.onsuccess = () => {
                Logger.info('Configuración guardada:', key);
                resolve();
            };

            request.onerror = () => {
                Logger.error('Error guardando configuración:', request.error);
                reject(request.error);
            };
        });
    }

    // Obtener configuración
    async getConfig(key: string): Promise<any> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['config'], 'readonly');
            const store = transaction.objectStore('config');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };

            request.onerror = () => {
                Logger.error('Error obteniendo configuración:', request.error);
                reject(request.error);
            };
        });
    }

    // Limpiar datos antiguos
    async cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        const cutoffTime = Date.now() - maxAge;

        // Limpiar mensajes antiguos
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const messageStore = transaction.objectStore('messages');
        const messageIndex = messageStore.index('timestamp');
        const messageRequest = messageIndex.openCursor(IDBKeyRange.upperBound(cutoffTime));

        messageRequest.onsuccess = () => {
            const cursor = messageRequest.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // Limpiar usuarios inactivos
        const userTransaction = this.db.transaction(['users'], 'readwrite');
        const userStore = userTransaction.objectStore('users');
        const userRequest = userStore.openCursor();

        userRequest.onsuccess = () => {
            const cursor = userRequest.result;
            if (cursor) {
                const user = cursor.value as OfflineUser;
                if (user.lastSeen < cutoffTime) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };

        Logger.info('Limpieza de datos antiguos completada');
    }

    // Obtener estadísticas de almacenamiento
    async getStorageStats(): Promise<{
        messages: number;
        users: number;
        config: number;
        totalSize: number;
    }> {
        if (!this.db) {
            throw new Error('IndexedDB no inicializada');
        }

        const [messages, users, config] = await Promise.all([
            this.getCount('messages'),
            this.getCount('users'),
            this.getCount('config')
        ]);

        return {
            messages,
            users,
            config,
            totalSize: messages + users + config
        };
    }

    // Obtener conteo de registros en un store
    private async getCount(storeName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Cerrar conexión
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
            Logger.info('Conexión a IndexedDB cerrada');
        }
    }
}

// Instancia singleton
export const offlineStorage = new OfflineStorageService();

// Inicializar automáticamente
offlineStorage.init().catch(error => {
    Logger.error('Error inicializando almacenamiento offline:', error);
}); 