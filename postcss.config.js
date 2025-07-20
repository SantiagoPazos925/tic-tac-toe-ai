export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        // Optimizaciones adicionales para producción
        ...(process.env.NODE_ENV === 'production' && {
            'cssnano': {
                preset: ['default', {
                    discardComments: {
                        removeAll: true,
                    },
                    normalizeWhitespace: true,
                    colormin: true,
                    minifyFontValues: true,
                    minifySelectors: true,
                    mergeLonghand: true,
                    mergeRules: true,
                    reduceIdents: false, // Mantener para animaciones
                    zindex: false, // Mantener z-index para componentes
                }]
            }
        })
    },
} 