# Organización de Estilos CSS

## Estructura de Archivos

### Base (`/base/`)
- **`variables.css`** - Variables CSS globales (colores, espaciado, fuentes, etc.)
- **`reset.css`** - Reset CSS y estilos base del body y App
- **`components.css`** - Componentes base reutilizables (botones, inputs, cards, etc.)

### Componentes (`/components/`)
- **`auth.css`** - Estilos específicos para autenticación
- **`layout.css`** - Estilos para el layout principal
- **`chat.css`** - Estilos para el sistema de chat
- **`users.css`** - Estilos para la lista de usuarios
- **`context-menu.css`** - Estilos para menús contextuales

### Utilidades (`/utilities/`)
- **`animations.css`** - Animaciones y transiciones
- **`helpers.css`** - Clases utilitarias adicionales
- **`responsive.css`** - Media queries y estilos responsive

## Clases Base Reutilizables

### Botones
```css
.btn              /* Botón primario */
.btn-secondary    /* Botón secundario */
.btn-ghost        /* Botón fantasma */
.btn-sm           /* Botón pequeño */
.btn-lg           /* Botón grande */
```

### Inputs
```css
.input            /* Input base */
.input-sm         /* Input pequeño */
.input-lg         /* Input grande */
.input.error      /* Input con error */
```

### Cards
```css
.card             /* Card base */
.card-header      /* Header de card */
.card-title       /* Título de card */
```

### Scrollbars
```css
.scrollbar        /* Scrollbar estándar */
.scrollbar-thin   /* Scrollbar delgado */
```

### Estados
```css
.status-dot.connected     /* Punto de estado conectado */
.status-dot.disconnected  /* Punto de estado desconectado */
```

### Utilidades de Texto
```css
.text-primary     /* Texto primario */
.text-secondary   /* Texto secundario */
.text-muted       /* Texto atenuado */
.text-accent      /* Texto de acento */
.text-success     /* Texto de éxito */
.text-danger      /* Texto de error */
.text-center      /* Texto centrado */
.text-left        /* Texto izquierda */
.text-right       /* Texto derecha */
```

### Utilidades de Flexbox
```css
.flex             /* display: flex */
.flex-col         /* flex-direction: column */
.flex-row         /* flex-direction: row */
.items-center     /* align-items: center */
.justify-center   /* justify-content: center */
.justify-between  /* justify-content: space-between */
.flex-1           /* flex: 1 */
.flex-shrink-0    /* flex-shrink: 0 */
```

### Utilidades de Posición
```css
.relative         /* position: relative */
.absolute         /* position: absolute */
.fixed            /* position: fixed */
```

### Utilidades de Overflow
```css
.overflow-hidden  /* overflow: hidden */
.overflow-auto    /* overflow: auto */
.overflow-y-auto  /* overflow-y: auto */
.overflow-x-auto  /* overflow-x: auto */
```

## Beneficios de la Nueva Organización

1. **Reducción de Código Duplicado**: Los estilos comunes están centralizados en `components.css`
2. **Consistencia**: Todas las clases base siguen el mismo patrón de diseño
3. **Mantenibilidad**: Cambios en estilos base se reflejan automáticamente en todos los componentes
4. **Reutilización**: Las clases utilitarias pueden usarse en cualquier componente
5. **Escalabilidad**: Fácil agregar nuevas clases base sin duplicar código

## Uso de Clases Base

### En lugar de duplicar estilos:
```css
/* ❌ Antes - Código duplicado */
.auth-button {
    background: var(--discord-accent);
    color: white;
    border: none;
    padding: var(--spacing-md) var(--spacing-lg);
    /* ... más propiedades */
}

.send-button {
    background: var(--discord-accent);
    color: white;
    border: none;
    padding: var(--spacing-md) var(--spacing-lg);
    /* ... mismas propiedades */
}
```

### Usar estilos consistentes:
```css
/* ✅ Ahora - Estilos consistentes */
.auth-button {
    background: var(--discord-accent);
    color: white;
    border: none;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-family: var(--font-family-base);
    min-height: var(--button-height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: var(--spacing-sm);
}

.send-button {
    background: var(--discord-accent);
    color: white;
    border: none;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-family: var(--font-family-base);
    min-height: var(--button-height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
}
```

## Variables CSS Mejoradas

### Nuevas variables agregadas:
- `--discord-shadow-hover`: Sombra para hover effects
- `--discord-shadow-focus`: Sombra para focus states
- `--font-family-base`: Fuente base del sistema
- `--font-family-emoji`: Fuente para emojis

### Uso consistente:
```css
/* Antes */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

/* Ahora */
box-shadow: var(--discord-shadow-hover);
```

## Responsive Design

Las variables CSS incluyen breakpoints y dimensiones responsive:
- `--mobile`, `--tablet`, `--desktop`, `--large-desktop`
- `--sidebar-width-mobile`, `--sidebar-width-tablet`, etc.
- `--padding-mobile`, `--padding-tablet`, etc.

## Mejores Prácticas

1. **Usar clases base**: Siempre preferir las clases base sobre duplicar estilos
2. **Variables CSS**: Usar variables CSS en lugar de valores hardcodeados
3. **Consistencia**: Usar las mismas variables CSS para elementos similares
4. **Responsive**: Usar las variables responsive para consistencia
5. **Documentación**: Mantener este archivo actualizado con cambios 