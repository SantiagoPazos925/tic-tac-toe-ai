import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthForm as AuthFormType } from '../types';
import { isValidEmail, isValidUsername, isValidPassword } from '../utils/formatters';

export const AuthForm = () => {
    const { login, register, isLoading } = useAuthContext();
    const [isLogin, setIsLogin] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<AuthFormType>({
        username: '',
        email: '',
        password: ''
    });

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!isValidUsername(formData.username)) {
            newErrors.username = 'El nombre de usuario debe tener entre 3 y 20 caracteres';
        }

        if (!isLogin && !isValidEmail(formData.email)) {
            newErrors.email = 'Ingresa un email válido';
        }

        if (!isValidPassword(formData.password)) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (isLogin) {
                await login(formData.username, formData.password);
            } else {
                await register(formData);
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            setErrors({ general: error instanceof Error ? error.message : 'Error de autenticación' });
        }
    };

    const handleInputChange = (field: keyof AuthFormType, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <motion.div className="auth-container" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
            <h1>🎮 Lobby de Juegos</h1>

            <div className="auth-form-container">
                <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>

                {errors.general && (
                    <div className="auth-error">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        required
                        className={`auth-input ${errors.username ? 'error' : ''}`}
                    />
                    {errors.username && <span className="field-error">{errors.username}</span>}

                    {!isLogin && (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                                className={`auth-input ${errors.email ? 'error' : ''}`}
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </>
                    )}

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className={`auth-input ${errors.password ? 'error' : ''}`}
                    />
                    {errors.password && <span className="field-error">{errors.password}</span>}

                    <motion.button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {isLoading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    </motion.button>
                </form>

                <div className="auth-switch">
                    <p>
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        <motion.button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrors({});
                                setFormData({ username: '', email: '', password: '' });
                            }}
                            className="switch-button"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                        </motion.button>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}; 