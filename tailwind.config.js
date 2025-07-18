/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                discord: {
                    bg: '#36393f',
                    secondary: '#2f3136',
                    tertiary: '#202225',
                    accent: '#5865f2',
                    'accent-hover': '#4752c4',
                    success: '#57f287',
                    warning: '#faa61a',
                    danger: '#ed4245',
                    'text-primary': '#ffffff',
                    'text-secondary': '#b9bbbe',
                    'text-muted': '#72767d',
                    border: '#40444b',
                    'input-bg': '#40444b',
                    'card-bg': '#2f3136',
                    hover: '#40444b',
                }
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '20px',
                '2xl': '24px',
                '3xl': '32px',
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
            },
            fontSize: {
                'xs': '10px',
                'sm': '12px',
                'md': '14px',
                'lg': '16px',
                'xl': '18px',
                '2xl': '20px',
                '3xl': '24px',
            },
            transitionDuration: {
                'fast': '0.15s',
                'normal': '0.2s',
                'slow': '0.3s',
            },
            zIndex: {
                'dropdown': '1000',
                'modal': '2000',
                'tooltip': '3000',
            },
            height: {
                'header': '48px',
                'input': '40px',
                'button': '40px',
                'card': '60px',
            },
            width: {
                'sidebar': '240px',
                'userlist': '240px',
            },
            screens: {
                'mobile': '480px',
                'tablet': '768px',
                'desktop': '1024px',
                'large-desktop': '1200px',
            },
            boxShadow: {
                'discord': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
                'discord-hover': '0 2px 8px rgba(0, 0, 0, 0.2)',
                'discord-focus': '0 0 0 2px rgba(88, 101, 242, 0.2)',
            },
            fontFamily: {
                'base': ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
                'emoji': ['Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Android Emoji', 'EmojiSymbols', 'EmojiOne Mozilla', 'Twemoji Mozilla', 'Segoe UI Symbol', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
} 