import { Category } from "../Interfaces/Category";
import { Camera, Shirt, Home, Brush, Bike, Watch, Tag, Film, Gamepad, Heart, Lightbulb, Refrigerator, Code, Armchair, Lamp, Headphones, Car, Lock } from "lucide-react";

export const categories: Category[] = [
    { id: 'electronics', name: 'Electronics', count: 430, icon: Camera },
    { id: 'fashion', name: 'Fashion', count: 620, icon: Shirt },
    { id: 'home', name: 'Home & Living', count: 382, icon: Home },
    { id: 'beauty', name: 'Beauty', count: 174, icon: Brush },
    { id: 'sports', name: 'Sports', count: 235, icon: Bike },
    { id: 'wearables', name: 'Wearables', count: 150, icon: Watch },
    { id: 'accessories', name: 'Accessories', count: 268, icon: Tag },
    { id: 'entertainment', name: 'Entertainment', count: 212, icon: Film },
    { id: 'gaming', name: 'Gaming', count: 140, icon: Gamepad },
    { id: 'health', name: 'Health', count: 90, icon: Heart },
    { id: 'smart home', name: 'Smart Home', count: 124, icon: Lightbulb },
    { id: 'appliances', name: 'Appliances', count: 96, icon: Refrigerator },
    { id: 'software', name: 'Software', count: 185, icon: Code },
    { id: 'furniture', name: 'Furniture', count: 170, icon: Armchair },
    { id: 'lighting', name: 'Lighting', count: 85, icon: Lamp },
    { id: 'audio', name: 'Audio', count: 130, icon: Headphones },
    { id: 'transportation', name: 'Transportation', count: 45, icon: Car },
    { id: 'security', name: 'Security', count: 65, icon: Lock }
];