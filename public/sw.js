// Service Worker para Tic-Tac-Toe AI
const CACHE_NAME = 'tic-tac-toe-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Archivos estáticos para cache offline
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico'
];

// Recursos críticos para cache inmediato
const CRITICAL_RESOURCES = [
    '/src/styles/index.css',
    '/src/components/AuthForm.js',
    '/src/components/LobbyHeader.js'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
    // Cache First: Para recursos estáticos que no cambian
    CACHE_FIRST: 'cache-first',
    // Network First: Para datos dinámicos que necesitan estar actualizados
    NETWORK_FIRST: 'network-first',
    // Stale While Revalidate: Para recursos que pueden estar desactualizados temporalmente
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Service Worker: Cacheando archivos estáticos');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker: Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Error en instalación', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Limpiar caches antiguos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Service Worker: Eliminando cache antiguo', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activación completada');
                return self.clients.claim();
            })
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests no-GET
    if (request.method !== 'GET') {
        return;
    }

    // Estrategia para diferentes tipos de recursos
    if (isStaticResource(url)) {
        event.respondWith(cacheFirst(request));
    } else if (isApiRequest(url)) {
        event.respondWith(networkFirst(request));
    } else if (isImageRequest(url)) {
        event.respondWith(staleWhileRevalidate(request));
    } else {
        event.respondWith(networkFirst(request));
    }
});

// Función para determinar si es un recurso estático
function isStaticResource(url) {
    return url.pathname.startsWith('/assets/') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.ttf');
}

// Función para determinar si es una request de API
function isApiRequest(url) {
    return url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/socket.io/');
}

// Función para determinar si es una imagen
function isImageRequest(url) {
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Estrategia Cache First
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📦 Service Worker: Cache hit para', request.url);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('❌ Service Worker: Error en cache-first', error);
        return new Response('Offline - Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('🌐 Service Worker: Network fallback para', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response('Offline - Datos no disponibles', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        console.log('🔄 Service Worker: Error en revalidación para', request.url);
    });

    return cachedResponse || fetchPromise;
}

// Background Sync para mensajes offline
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Service Worker: Sincronización en segundo plano');
        event.waitUntil(syncOfflineData());
    }
});

// Función para sincronizar datos offline
async function syncOfflineData() {
    try {
        // Aquí se implementaría la lógica para sincronizar
        // mensajes offline, cambios de estado, etc.
        console.log('📤 Service Worker: Sincronizando datos offline');

        // Ejemplo: enviar mensajes pendientes
        const pendingMessages = await getPendingMessages();
        for (const message of pendingMessages) {
            await sendMessage(message);
        }
    } catch (error) {
        console.error('❌ Service Worker: Error en sincronización', error);
    }
}

// Función para obtener mensajes pendientes (placeholder)
async function getPendingMessages() {
    // Implementar lógica para obtener mensajes del IndexedDB
    return [];
}

// Función para enviar mensaje (placeholder)
async function sendMessage(message) {
    // Implementar lógica para enviar mensaje al servidor
    console.log('📤 Service Worker: Enviando mensaje', message);
}

// Push notifications (para futuras implementaciones)
self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push notification recibida');

    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver',
                icon: '/favicon.ico'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/favicon.ico'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Tic-Tac-Toe AI', options)
    );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Notificación clickeada');

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Mensajes del cliente
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Mensaje recibido', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('🔧 Service Worker: Cargado correctamente'); 