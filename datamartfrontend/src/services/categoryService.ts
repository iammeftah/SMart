import axios from 'axios';
import { Category } from '../Interfaces/Category';

const API_URL = 'http://localhost:8082/api/categories';

export const CategoryService = {
    getAllCategories: async (): Promise<Category[]> => {
        try {
            const response = await axios.get(API_URL);
            console.log(response);
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    getCategoryById: async (id: number): Promise<Category> => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    }
};