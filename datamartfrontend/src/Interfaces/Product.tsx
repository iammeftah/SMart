


export interface Product {
    id: string  // Changed from id: string
    name: string
    description: string
    price: number
    rating: number
    reviews: number
    image: string
    category: string[]
    brandId: number
    brandName: string
    isNew: boolean
    isFeatured: boolean
    postedDate: Date
    purchaseCount: number
    clearance: boolean
    discount: number
    stock:number
    similarity?: number;

}

