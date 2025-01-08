export interface CartItem {
    id: string;          // Added to match React component requirements
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    discount?: number;
    brandName?: string;
    subtotal: number;
}
