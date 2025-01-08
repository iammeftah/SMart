import { Heart, ShoppingCart, Sparkles, Star, StarHalf } from 'lucide-react'
import { CustomButton } from "./CustomButton"
import { motion } from "framer-motion"
import { Product } from "../Interfaces/Product"
import { useState } from "react"
import { WishlistService } from "../services/WishlistService"
import Toast from './Toast'
import { cartService } from "../services/CartService"
import { useParams } from "react-router-dom"

interface ProductCardProps {
    product: Product & { similarity?: number }
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const { id } = useParams<{ id: string }>()
    const [quantity, setQuantity] = useState(1)
    const [addingToCart, setAddingToCart] = useState(false)
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastType, setToastType] = useState<'success' | 'error'>('success')

    // Safety check - if product is undefined, show loading state
    if (!product) {
        return (
            <div className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-lg p-4">
                <p>Loading...</p>
            </div>
        );
    }

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message)
        setToastType(type)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    // Safe number formatting
    const formatNumber = (value: number | undefined) => {
        if (value === undefined || value === null) return '0.00';
        return value.toFixed(2);
    }

    const handleAddToWishlist = async () => {
        try {
            if (isInWishlist) {
                await WishlistService.removeFromWishlist(product.id)
                setIsInWishlist(false)
                showToastMessage('Removed from wishlist', 'success')
            } else {
                await WishlistService.addToWishlist(product.id)
                setIsInWishlist(true)
                showToastMessage('Added to wishlist', 'success')
            }
        } catch (error) {
            console.error('Error updating wishlist:', error)
            showToastMessage('Failed to update wishlist', 'error')
        }
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}
            className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group relative w-full h-full"
        >
            <a href={`/product/${product.id}`} className="flex flex-col h-full">
                <div className="w-full h-80">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex flex-row gap-2">
                        <CustomButton
                            variant="ghost"
                            size="sm"
                            className={`p-2 bg-white dark:bg-neutral-800 bg-opacity-40 dark:bg-opacity-40 backdrop-blur-md dark:backdrop-blur-md hover:bg-opacity-70 dark:hover:bg-opacity-70 ${isInWishlist ? 'text-rose-500' : 'text-neutral-600 dark:text-neutral-300'}`}
                            onClick={(e) => {
                                e.preventDefault()
                                handleAddToWishlist()
                            }}
                        >
                            <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'}/>
                            <span className="sr-only">
                                {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            </span>
                        </CustomButton>
                    </div>
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.isNew && (
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                New Arrival
                            </span>
                        )}
                        {product.discount > 0 && (
                            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
                                {product.discount}% OFF
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                            {Array.from({length: Math.floor(product.rating || 0)}).map((_, i) => (
                                <Star key={`star-${i}`} className="w-4 h-4 text-yellow-400 fill-current"/>
                            ))}
                            {(product.rating % 1) !== 0 && (
                                <StarHalf className="w-4 h-4 text-yellow-400 fill-current"/>
                            )}
                        </div>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            ({product.reviews || 0})
                        </span>
                    </div>
                    <h3 className="font-semibold line-clamp-2 mb-2 text-neutral-900 dark:text-neutral-100 group-hover:text-primary dark:group-hover:text-primary transition-colors text-start">
                        {product.name || 'Unnamed Product'}
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                        <p className="bg-rose-600 dark:bg-rose-800 rounded-lg px-2 text-neutral-100 font-bold text-lg">
                            ${formatNumber(product.price)}
                        </p>
                        {product.isFeatured && (
                            <span className="text-rose-400 dark:text-rose-500 text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3"/>
                                Featured
                            </span>
                        )}
                    </div>
                    {product.similarity !== undefined && (
                        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            Similarity: {formatNumber(product.similarity * 100)}%
                        </div>
                    )}
                </div>
            </a>
            <Toast
                message={toastMessage}
                show={showToast}
                type={toastType}
            />
        </motion.div>
    )
}