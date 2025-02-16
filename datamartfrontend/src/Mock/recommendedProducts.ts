// Create a new file: src/mocks/recommendedProducts.ts

import { Product } from "../Interfaces/Product";

export const mockRecommendedProducts: Product[] = [
    {
        id: "rec-1",
        name: "4K Ultra HD Smart TV",
        description: "55-inch Smart TV with HDR and AI upscaling",
        price: 799.99,
        rating: 4.5,
        reviews: 128,
        image: "https://placehold.co/400x300",
        category: ["Electronics", "TV & Home Theater"],
        brandId: 1,
        brandName: "TechVision",
        isNew: true,
        isFeatured: true,
        postedDate: new Date("2024-11-01"),
        purchaseCount: 89,
        clearance: false,
        discount: 15,
        stock: 10,
    },
    {
        id: "rec-2",
        name: "Wireless Noise-Cancelling Headphones",
        description: "Premium wireless headphones with active noise cancellation",
        price: 249.99,
        rating: 4.8,
        reviews: 256,
        image: "https://placehold.co/400x300",
        category: ["Electronics", "Audio"],
        brandId: 2,
        brandName: "SoundMaster",
        isNew: false,
        isFeatured: true,
        postedDate: new Date("2024-10-15"),
        purchaseCount: 167,
        clearance: false,
        discount: 0,
        stock: 0,
    },
    {
        id: "rec-3",
        name: "Smart Home Security Camera",
        description: "1080p wireless security camera with night vision",
        price: 129.99,
        rating: 4.3,
        reviews: 89,
        image: "https://placehold.co/400x300",
        category: ["Electronics", "Smart Home"],
        brandId: 3,
        brandName: "SecureView",
        isNew: true,
        isFeatured: false,
        postedDate: new Date("2024-11-10"),
        purchaseCount: 45,
        clearance: false,
        discount: 10,
        stock: 32,
    }
];