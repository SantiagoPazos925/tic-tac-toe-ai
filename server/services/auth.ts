import jwt, { Secret } from 'jsonwebtoken';
import { jwtConfig } from '../config/index.js';
import { createUser, findUserByUsername, findUserByEmail, updateUserStatus, verifyPassword } from './database.js';
import { AuthUser, AuthResponse, LoginRequest, RegisterRequest } from '../types/index.js';
import { validateRegisterData, validateLoginData, ValidationError } from '../utils/validation.js';
import { Logger } from '../utils/logger.js';

export class AuthService {
    // Generar token JWT
    private static generateToken(user: AuthUser): string {
        return jwt.sign(
            { id: user.id, username: user.username },
            jwtConfig.secret as Secret,
            { expiresIn: jwtConfig.expiresIn }
        );
    }

    // Registrar nuevo usuario
    static async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            // Validar datos de entrada
            validateRegisterData(userData);

            // Verificar si el usuario ya existe
            const existingUser = await findUserByUsername(userData.username);
            if (existingUser) {
                throw new ValidationError('El nombre de usuario ya está en uso');
            }

            const existingEmail = await findUserByEmail(userData.email);
            if (existingEmail) {
                throw new ValidationError('El email ya está registrado');
            }

            // Crear usuario
            const user = await createUser({
                username: userData.username,
                email: userData.email,
                password_hash: userData.password
            });

            // Actualizar estado del usuario
            await updateUserStatus(user.id!, 'online');

            // Generar token
            const authUser: AuthUser = {
                id: user.id!,
                username: user.username,
                email: user.email
            };

            const token = this.generateToken(authUser);

            Logger.auth(`Usuario registrado: ${userData.username}`);

            return {
                message: 'Usuario registrado exitosamente',
                token,
                user: authUser
            };

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            Logger.error('Error en registro', error);
            throw new Error('Error interno del servidor');
        }
    }

    // Iniciar sesión
    static async login(loginData: LoginRequest): Promise<AuthResponse> {
        try {
            // Validar datos de entrada
            validateLoginData(loginData);

            // Buscar usuario
            const user = await findUserByUsername(loginData.username);
            if (!user) {
                throw new ValidationError('Credenciales inválidas');
            }

            // Verificar contraseña
            const isValidPassword = await verifyPassword(loginData.password, user.password_hash);
            if (!isValidPassword) {
                throw new ValidationError('Credenciales inválidas');
            }

            // Actualizar último login y estado
            await updateUserStatus(user.id!, 'online');

            // Generar token
            const authUser: AuthUser = {
                id: user.id!,
                username: user.username,
                email: user.email
            };

            const token = this.generateToken(authUser);

            Logger.auth(`Usuario conectado: ${loginData.username}`);

            return {
                message: 'Inicio de sesión exitoso',
                token,
                user: authUser
            };

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            Logger.error('Error en login', error);
            throw new Error('Error interno del servidor');
        }
    }

    // Verificar token
    static verifyToken(token: string): AuthUser | null {
        try {
            const decoded = jwt.verify(token, jwtConfig.secret as Secret) as AuthUser;
            return decoded;
        } catch (error) {
            Logger.auth('Token inválido', { token: token.substring(0, 10) + '...' });
            return null;
        }
    }

    // Obtener perfil del usuario
    static async getProfile(username: string): Promise<AuthUser | null> {
        try {
            const user = await findUserByUsername(username);
            if (!user) {
                return null;
            }

            return {
                id: user.id!,
                username: user.username,
                email: user.email
            };
        } catch (error) {
            Logger.error('Error obteniendo perfil', error);
            throw new Error('Error interno del servidor');
        }
    }
} 