# Guía de Tailwind CSS en el Proyecto

## 🎯 **Configuración Implementada**

### **Archivos de Configuración:**
- `tailwind.config.js` - Configuración principal con tema Discord
- `postcss.config.js` - Configuración de PostCSS
- `src/styles/tailwind.css` - Estilos base de Tailwind con componentes personalizados

### **Tema Discord Personalizado:**

```javascript
// Colores del tema Discord
discord: {
  bg: '#36393f',           // Fondo principal
  secondary: '#2f3136',    // Fondo secundario
  tertiary: '#202225',     // Fondo terciario
  accent: '#5865f2',       // Color de acento (azul)
  'accent-hover': '#4752c4', // Hover del acento
  success: '#57f287',      // Verde de éxito
  warning: '#faa61a',      // Amarillo de advertencia
  danger: '#ed4245',       // Rojo de error
  'text-primary': '#ffffff',    // Texto principal
  'text-secondary': '#b9bbbe',  // Texto secundario
  'text-muted': '#72767d',      // Texto atenuado
  border: '#40444b',       // Color de bordes
  'input-bg': '#40444b',   // Fondo de inputs
  hover: '#40444b',        // Color de hover
}
```

## 🚀 **Componentes Base Disponibles**

### **Botones:**
```tsx
// Botón primario
<button className="btn">Enviar</button>

// Botón secundario
<button className="btn btn-secondary">Cancelar</button>

// Botón fantasma
<button className="btn btn-ghost">Configuración</button>

// Tamaños
<button className="btn btn-sm">Pequeño</button>
<button className="btn btn-lg">Grande</button>
```

### **Inputs:**
```tsx
// Input base
<input className="input" placeholder="Escribe aquí..." />

// Input con error
<input className="input border-discord-danger" />

// Tamaños
<input className="input input-sm" />
<input className="input input-lg" />
```

### **Cards:**
```tsx
// Card básica
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Título</h3>
  </div>
  <p>Contenido de la card</p>
</div>
```

### **Estados:**
```tsx
// Punto de estado
<span className="status-dot connected"></span>
<span className="status-dot disconnected"></span>
```

### **Scrollbars:**
```tsx
// Scrollbar estándar
<div className="scrollbar">Contenido con scroll</div>

// Scrollbar delgado
<div className="scrollbar-thin">Contenido con scroll delgado</div>
```

## 🎨 **Clases Utilitarias del Tema**

### **Colores:**
```tsx
// Fondos
<div className="bg-discord-bg">Fondo principal</div>
<div className="bg-discord-secondary">Fondo secundario</div>
<div className="bg-discord-tertiary">Fondo terciario</div>

// Textos
<p className="text-discord-text-primary">Texto principal</p>
<p className="text-discord-text-secondary">Texto secundario</p>
<p className="text-discord-text-muted">Texto atenuado</p>
<p className="text-discord-accent">Texto de acento</p>

// Estados
<p className="text-discord-success">Éxito</p>
<p className="text-discord-warning">Advertencia</p>
<p className="text-discord-danger">Error</p>
```

### **Espaciado:**
```tsx
// Padding
<div className="p-xs">4px</div>
<div className="p-sm">8px</div>
<div className="p-md">12px</div>
<div className="p-lg">16px</div>
<div className="p-xl">20px</div>
<div className="p-2xl">24px</div>
<div className="p-3xl">32px</div>

// Margin
<div className="m-xs">4px</div>
<div className="m-sm">8px</div>
<div className="m-md">12px</div>
<div className="m-lg">16px</div>
<div className="m-xl">20px</div>
<div className="m-2xl">24px</div>
<div className="m-3xl">32px</div>
```

### **Bordes:**
```tsx
// Bordes redondeados
<div className="rounded-sm">4px</div>
<div className="rounded-md">8px</div>
<div className="rounded-lg">12px</div>

// Bordes
<div className="border border-discord-border">Borde estándar</div>
<div className="border border-discord-accent">Borde de acento</div>
```

### **Sombras:**
```tsx
<div className="shadow-discord">Sombra estándar</div>
<div className="shadow-discord-hover">Sombra de hover</div>
<div className="shadow-discord-focus">Sombra de focus</div>
```

### **Fuentes:**
```tsx
// Tamaños
<p className="text-xs">10px</p>
<p className="text-sm">12px</p>
<p className="text-md">14px</p>
<p className="text-lg">16px</p>
<p className="text-xl">18px</p>
<p className="text-2xl">20px</p>
<p className="text-3xl">24px</p>

// Familias
<p className="font-base">Fuente base</p>
<p className="font-emoji">Fuente para emojis</p>
```

### **Transiciones:**
```tsx
<div className="transition-all duration-fast">0.15s</div>
<div className="transition-all duration-normal">0.2s</div>
<div className="transition-all duration-slow">0.3s</div>
```

## 📱 **Responsive Design**

### **Breakpoints:**
```tsx
// Mobile first
<div className="w-full md:w-sidebar">Ancho completo en móvil, sidebar en desktop</div>

// Breakpoints disponibles
mobile: 480px
tablet: 768px
desktop: 1024px
large-desktop: 1200px
```

### **Ejemplos Responsive:**
```tsx
// Layout responsive
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-sidebar">Sidebar</div>
  <div className="flex-1">Contenido principal</div>
</div>

// Padding responsive
<div className="p-md md:p-lg lg:p-xl">Padding que aumenta con el tamaño de pantalla</div>

// Texto responsive
<h1 className="text-xl md:text-2xl lg:text-3xl">Título responsive</h1>
```

## 🔧 **Migración de Componentes**

### **Antes (CSS Personalizado):**
```tsx
<div className="auth-container">
  <div className="auth-form-container">
    <input className="auth-input" />
    <button className="auth-button">Enviar</button>
  </div>
</div>
```

### **Después (Tailwind):**
```tsx
<div className="flex-1 flex flex-col items-center justify-center bg-discord-bg p-xl min-h-screen">
  <div className="bg-discord-secondary border border-discord-border rounded-md p-3xl w-full max-w-md shadow-discord">
    <input className="input" />
    <button className="btn">Enviar</button>
  </div>
</div>
```

## 🎯 **Mejores Prácticas**

### **1. Usar Componentes Base:**
```tsx
// ✅ Correcto
<button className="btn">Enviar</button>
<input className="input" />

// ❌ Evitar
<button className="bg-discord-accent text-white px-md py-lg rounded-sm...">Enviar</button>
```

### **2. Combinar con Clases Utilitarias:**
```tsx
// ✅ Correcto
<button className="btn w-full md:w-auto">Botón responsive</button>
<input className="input border-discord-danger" /> // Input con error
```

### **3. Usar Variables del Tema:**
```tsx
// ✅ Correcto
<div className="bg-discord-bg text-discord-text-primary">

// ❌ Evitar
<div className="bg-[#36393f] text-[#ffffff]">
```

### **4. Responsive Design:**
```tsx
// ✅ Correcto
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">

// ✅ Correcto
<div className="p-md md:p-lg lg:p-xl">
```

## 🚀 **Próximos Pasos**

1. **Migrar componentes restantes** a Tailwind CSS
2. **Crear más componentes base** según sea necesario
3. **Optimizar el bundle** eliminando CSS no utilizado
4. **Documentar patrones** específicos del proyecto

## 📚 **Recursos Útiles**

- [Documentación oficial de Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet) 