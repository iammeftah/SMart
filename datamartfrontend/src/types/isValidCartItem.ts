import { CartItem } from "./CartItems";

export function isValidCartItem(item: any): item is CartItem {
    return item
        && typeof item.productId === 'string'
        && typeof item.name === 'string'
        && typeof item.price === 'number'
        && typeof item.quantity === 'number'
        && typeof item.image === 'string';
}