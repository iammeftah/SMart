import axios from 'axios';
import { Brand } from '../Interfaces/Brand';

const API_URL = 'http://localhost:8082/api/brands';

export const BrandService = {
    getAllBrands: async (): Promise<Brand[]> => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching brands:', error);
            throw error;
        }
    },

    getBrandById: async (id: number): Promise<Brand> => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching brand:', error);
            throw error;
        }
    }
};