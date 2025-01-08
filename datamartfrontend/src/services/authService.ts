// src/services/authService.ts

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


console.log('API_BASE_URL:', API_BASE_URL); // Debug log for API base URL

const API_URL = `http://localhost:8081/api/v1/auth`;
console.log('Full API_URL:', API_URL); // Debug log for full API URL


export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    id: string;
    token: string;
    email: string;
    fullName: string;
}

export interface DecodedToken {
    sub: string;  // email
    exp: number;  // expiration timestamp
    role?: string; // Make role optional as it's not present in the current token
    iat: number;  // issued at timestamp
}


class AuthService {
    private static instance: AuthService;
    private token: string | null = null;



    private constructor() {
        this.token = localStorage.getItem('token');
        // Add default headers for all requests
        axios.defaults.headers.common['Content-Type'] = 'application/json';
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {

            // Log the full axios config for debugging
            const axiosConfig = {
                method: 'post',
                url: `${API_URL}/register`,
                data: userData,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            // console.log('Axios Config:', axiosConfig);

            const response = await axios(axiosConfig);

            // console.log('Registration response:', response.data);
            const authResponse = response.data as AuthResponse;
            this.setToken(authResponse.token);
            return authResponse;
        } catch (error: any) {
            console.error('Full registration error:', error);

            // More detailed error logging
            if (error.response) {
                console.error('Response error details:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }

            if (error.request) {
                console.error('Request error details:', {
                    method: error.request.method,
                    url: error.request.url,
                    status: error.request.status,
                    responseText: error.request.responseText
                });
            }

            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            console.log('Sending login request:', { ...credentials, password: '[REDACTED]' });
            const response = await axios.post(`${API_URL}/login`, credentials);
            console.log('Login response:', response.data);
            const authResponse = response.data as AuthResponse;
            this.setToken(authResponse.token);
            return authResponse;
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Login failed');
            } else if (error.request) {
                throw new Error('Network error - Unable to reach the server');
            }
            throw new Error('An unexpected error occurred during login');
        }
    }

    async logout(navigate: (path: string) => void): Promise<void> {
        try {
            if (this.token) {
                console.log("Logging out...");
                await axios.post(`${API_URL}/logout`, null, {
                    headers: this.getAuthHeaders()
                });
                console.log("Logged out successfully");
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            this.clearToken();
            navigate('/'); // Navigate to home after logout
        }
    }

    isAuthenticated(): boolean {
        if (!this.token) return false;

        try {
            const decoded = this.decodeToken();
            if (!decoded) return false;

            // Check if token is expired
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    }

    getToken(): string | null {
        return this.token;
    }

    getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.token}`
        };
    }

    private setToken(token: string): void {
        this.token = token;
        localStorage.setItem('token', token);
    }

    private clearToken(): void {
        this.token = null;
        localStorage.removeItem('token');
    }

    decodeToken(): DecodedToken | null {
        if (!this.token) return null;
        try {
            const decoded = jwtDecode<DecodedToken>(this.token);
            console.log('Decoded token:', decoded);
            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    getUserRole(): string | null {
        const decoded = this.decodeToken();
        console.log('Decoded token in getUserRole:', decoded);
        // If role is not in the token, check if the email is admin@gmail.com
        if (decoded && !decoded.role) {
            return decoded.sub === 'admin@gmail.com' ? 'ADMIN' : 'USER';
        }
        return decoded ? decoded.role || null : null;
    }

    isAdmin(): boolean {
        const role = this.getUserRole();
        console.log('User role in isAdmin:', role);
        return role === 'ADMIN';
    }

    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const response = await axios.get(`${API_URL}/check-email?email=${email}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error checking email existence:', error);
            return false;
        }
    }

}

export const authService = AuthService.getInstance();
