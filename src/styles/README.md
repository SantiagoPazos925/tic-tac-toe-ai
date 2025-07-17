# Estructura de Estilos

Esta carpeta contiene todos los estilos CSS organizados de manera modular para facilitar el mantenimiento y la escalabilidad del proyecto.

## Estructura de Directorios

```
src/styles/
├── index.css              # Archivo principal que importa todos los estilos
├── README.md              # Esta documentación
├── base/                  # Estilos base y fundamentales
│   ├── variables.css      # Variables CSS (colores, espaciado, etc.)
│   └── reset.css          # Reset CSS y estilos globales
├── components/            # Estilos específicos de componentes
│   ├── auth.css           # Estilos para autenticación
│   ├── layout.css         # Estilos para el layout principal
│   ├── chat.css           # Estilos para el chat
│   └── users.css          # Estilos para usuarios y perfiles
└── utilities/             # Utilidades y ayudantes
    ├── animations.css     # Animaciones y transiciones
    └── helpers.css        # Clases de utilidad CSS
```

## Variables CSS

Todas las variables CSS están definidas en `base/variables.css` y incluyen:

- **Colores**: Paleta de colores inspirada en Discord
- **Espaciado**: Sistema de espaciado consistente
- **Bordes**: Radio de bordes estandarizado
- **Transiciones**: Duración y timing de animaciones
- **Z-index**: Sistema de capas organizado

## Componentes

Cada componente tiene su propio archivo CSS que contiene:

- Estilos específicos del componente
- Estados (hover, focus, active)
- Responsive design cuando sea necesario
- Animaciones específicas

## Utilidades

### Animaciones (`utilities/animations.css`)
- Animaciones reutilizables (fadeIn, slideIn, etc.)
- Clases de utilidad para animaciones
- Efectos hover predefinidos

### Helpers (`utilities/helpers.css`)
- Clases de utilidad para flexbox
- Clases de espaciado (margin, padding)
- Clases de colores y backgrounds
- Clases de posicionamiento y display

## Uso

### Importar estilos
```typescript
// En el archivo principal (index.tsx)
import './styles/index.css';
```

### Usar clases de utilidad
```jsx
<div className="d-flex justify-center items-center p-4">
  <button className="auth-button hover-lift">
    Click me
  </button>
</div>
```

### Usar animaciones
```jsx
<div className="animate-fade-in">
  Contenido con animación
</div>
```

## Convenciones

1. **Nomenclatura**: Usar kebab-case para clases CSS
2. **Especificidad**: Mantener especificidad baja usando clases específicas
3. **Responsive**: Usar media queries cuando sea necesario
4. **Accesibilidad**: Mantener contraste adecuado y estados focusables
5. **Performance**: Usar transform y opacity para animaciones

## Mantenimiento

- Agregar nuevas variables en `base/variables.css`
- Crear nuevos archivos de componentes en `components/`
- Agregar utilidades en `utilities/`
- Actualizar esta documentación cuando se agreguen nuevas funcionalidades

## Temas

El sistema está preparado para soportar múltiples temas. Para agregar un nuevo tema:

1. Crear un nuevo archivo de variables con el tema
2. Usar CSS custom properties para los valores
3. Cambiar las variables en el elemento root

```css
/* Ejemplo de tema claro */
[data-theme="light"] {
  --discord-bg: #ffffff;
  --discord-text-primary: #000000;
  /* ... más variables */
}
``` 