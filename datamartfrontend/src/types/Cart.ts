import { CartItem } from "./CartItems";

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    loyaltyPoints: number;
    lastModified: Date;
}