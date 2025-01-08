// src/services/userService.ts

import axios from 'axios';
import { authService } from './authService';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_URL = `${API_BASE_URL}/v1/users`;

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

export interface UpdateUserRequest {
    fullName: string;
    email: string;
}

class UserService {
    private static instance: UserService;

    private constructor() {}

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const response = await axios.get(API_URL, {
                headers: authService.getAuthHeaders()
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch users');
            }
            throw error;
        }
    }

    async getUserById(id: string): Promise<User> {
        try {
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: authService.getAuthHeaders()
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch user');
            }
            throw error;
        }
    }

    async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
        try {
            const response = await axios.put(
                `${API_URL}/${id}`,
                userData,
                {
                    headers: authService.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to update user');
            }
            throw error;
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: authService.getAuthHeaders()
            });
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to delete user');
            }
            throw error;
        }
    }
}

export const userService = UserService.getInstance();