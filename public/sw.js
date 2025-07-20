// Service Worker optimizado para Tic-Tac-Toe AI
const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Archivos críticos para cache inmediato (First Paint)
const CRITICAL_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.svg'
];

// Recursos estáticos que cambian poco
const STATIC_RESOURCES = [
    '/src/styles/index.css',
    '/src/styles/base/reset.css',
    '/src/styles/base/variables.css'
];

// Tiempo máximo de cache para diferentes tipos de recursos
const CACHE_DURATIONS = {
    STATIC: 7 * 24 * 60 * 60 * 1000, // 7 días
    DYNAMIC: 24 * 60 * 60 * 1000,    // 1 día
    RUNTIME: 60 * 60 * 1000          // 1 hora
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando versión', CACHE_VERSION);

    event.waitUntil(
        Promise.all([
            // Cachear archivos críticos inmediatamente
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Cacheando archivos críticos');
                return cache.addAll(CRITICAL_FILES);
            }),
            // Cachear recursos estáticos
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('📦 Cacheando recursos estáticos');
                return cache.addAll(STATIC_RESOURCES);
            })
        ]).then(() => {
            console.log('✅ Service Worker: Instalación completada');
            return self.skipWaiting();
        }).catch(error => {
            console.error('❌ Service Worker: Error en instalación', error);
        })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando versión', CACHE_VERSION);

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Limpiar caches antiguos
                    if (!cacheName.includes(CACHE_VERSION)) {
                        console.log('🗑️ Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activación completada');
            return self.clients.claim();
        })
    );
});

// Interceptar requests con estrategias optimizadas
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests no-GET y cross-origin
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    // Estrategias específicas por tipo de recurso
    if (isCriticalResource(url)) {
        event.respondWith(cacheFirstStrategy(request));
    } else if (isStaticAsset(url)) {
        event.respondWith(staleWhileRevalidateStrategy(request));
    } else if (isApiRequest(url)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (isImageRequest(url)) {
        event.respondWith(imageStrategy(request));
    } else {
        event.respondWith(networkFirstStrategy(request));
    }
});

// Función para determinar si es un recurso crítico
function isCriticalResource(url) {
    return url.pathname === '/' ||
           url.pathname === '/index.html' ||
           url.pathname.includes('/manifest.json') ||
           url.pathname.includes('/icon.svg');
}

// Función para determinar si es un asset estático
function isStaticAsset(url) {
    return url.pathname.startsWith('/assets/') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.pathname.match(/\.(woff2?|ttf|eot)$/i);
}

// Función para determinar si es una request de API
function isApiRequest(url) {
    return url.pathname.startsWith('/api/') ||
           url.pathname.startsWith('/socket.io/');
}

// Función para determinar si es una imagen
function isImageRequest(url) {
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

// Estrategia Cache First para recursos críticos
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📦 Cache hit crítico:', request.url);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('❌ Error en cache-first:', error);
        return new Response('Offline - Recurso crítico no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Stale While Revalidate para assets estáticos
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // Revalidar en background
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            console.log('🔄 Revalidado:', request.url);
        }
        return networkResponse;
    }).catch(error => {
        console.log('🔄 Error en revalidación:', request.url, error);
    });

    return cachedResponse || fetchPromise;
}

// Estrategia Network First para APIs
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('🌐 Network fallback para:', request.url);
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

// Estrategia específica para imágenes
async function imageStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        if (cachedResponse) {
            console.log('🖼️ Imagen desde cache:', request.url);
            return cachedResponse;
        }
        
        // Fallback para imágenes
        return new Response('', {
            status: 404,
            statusText: 'Image not found'
        });
    }
}

// Background Sync optimizado
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Sincronización en segundo plano');
        event.waitUntil(syncOfflineData());
    }
});

// Función para sincronizar datos offline
async function syncOfflineData() {
    try {
        console.log('📤 Sincronizando datos offline');
        
        // Limpiar cache expirado
        await cleanExpiredCache();
        
        // Sincronizar mensajes pendientes
        const pendingMessages = await getPendingMessages();
        for (const message of pendingMessages) {
            await sendMessage(message);
        }
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
    }
}

// Limpiar cache expirado
async function cleanExpiredCache() {
    const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, RUNTIME_CACHE];
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const date = response.headers.get('date');
                if (date) {
                    const age = Date.now() - new Date(date).getTime();
                    const maxAge = getMaxAge(cacheName);
                    
                    if (age > maxAge) {
                        await cache.delete(request);
                        console.log('🗑️ Cache expirado eliminado:', request.url);
                    }
                }
            }
        }
    }
}

// Obtener tiempo máximo de cache por tipo
function getMaxAge(cacheName) {
    if (cacheName === STATIC_CACHE) return CACHE_DURATIONS.STATIC;
    if (cacheName === DYNAMIC_CACHE) return CACHE_DURATIONS.DYNAMIC;
    return CACHE_DURATIONS.RUNTIME;
}

// Función para obtener mensajes pendientes
async function getPendingMessages() {
    // Implementar lógica para obtener mensajes del IndexedDB
    return [];
}

// Función para enviar mensaje
async function sendMessage(message) {
    // Implementar lógica para enviar mensaje al servidor
    console.log('📤 Enviando mensaje:', message);
}

// Push notifications optimizadas
self.addEventListener('push', (event) => {
    console.log('🔔 Push notification recibida');

    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación',
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver',
                icon: '/icon.svg'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icon.svg'
            }
        ],
        requireInteraction: false,
        silent: false
    };

    event.waitUntil(
        self.registration.showNotification('Tic-Tac-Toe AI', options)
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
}); 