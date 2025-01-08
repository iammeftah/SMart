// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthResponse } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: AuthResponse | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        try {
            if (authService.isAuthenticated()) {
                const token = authService.getToken()!;
                localStorage.setItem("authToken", token); // Save token to localStorage
                const decoded = authService.decodeToken()!;
                setUser({
                    id: "0",
                    token,
                    email: decoded.sub,
                    fullName: '' // Fetch fullName if necessary
                });
            } else {
                localStorage.removeItem("authToken"); // Clear token if not authenticated
            }
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });
            setUser(response);
            localStorage.setItem("authToken", response.token); // Save token on login
            navigate('/store');
        } catch (error) {
            throw error;
        }
    };

    const register = async (fullName: string, email: string, password: string) => {
        try {
            const response = await authService.register({ fullName, email, password });
            setUser(response);
            navigate('/store');
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout(navigate);
            setUser(null);
            localStorage.removeItem("authToken"); // Remove token on logout
            navigate('/login');
            console.log("AuthContext: logged out");
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            localStorage.removeItem("authToken"); // Ensure token is cleared
            navigate('/login');
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: authService.isAdmin(),
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};