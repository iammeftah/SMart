'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, StarHalf, ArrowLeft, Clock, Tag, Building2, Calendar, ClipboardList, FileText, Percent } from 'lucide-react'
import { CustomButton } from '../components/CustomButton'
import { ProductService } from '../services/productsService'
import Toast from "../components/Toast"
import { WishlistService } from "../services/WishlistService"
import { cartService } from '../services/CartService'
import { Product } from '../Interfaces/Product'
import { authService } from "../services/authService"
import axios from 'axios'
import { ProductCard } from '../components/ProductCard'

type SuggestedProduct = Product & {
    similarity: number
}

export default function ProductPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [showZoom, setShowZoom] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const imageRef = useRef<HTMLImageElement>(null)

    const [addingToCart, setAddingToCart] = useState(false)
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [toastType, setToastType] = useState<'success' | 'error'>('success')
    const [userRating, setUserRating] = useState<number | null>(null)
    const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([])

    const getStoredRating = (productId: string): number | null => {
        const storedRating = localStorage.getItem(`userRating_${productId}`);
        return storedRating ? parseInt(storedRating, 10) : null;
    };

    const fetchSimilarProducts = async (productName: string) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/get_similar_products?product_name=${encodeURIComponent(productName)}&topn=5`
            );
            const similarProducts = response.data.similar_products || response.data.generic_products;

            // Filter out null products and handle errors more gracefully
            const productPromises = similarProducts.map(async ([name, similarity]: [string, number]) => {
                try {
                    const product = await ProductService.getProductByName(name);
                    if (!product) {
                        console.warn(`Similar product not found: ${name}`);
                        return null;
                    }
                    return { ...product, similarity };
                } catch (error) {
                    console.warn(`Error fetching similar product ${name}:`, error);
                    return null;
                }
            });

            const results = await Promise.all(productPromises);
            return results.filter((product): product is SuggestedProduct => product !== null);
        } catch (error) {
            console.error('Error fetching similar products:', error);
            return [];
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                setLoading(true)
                try {
                    const fetchedProduct = await ProductService.getProductById(id)
                    setProduct(fetchedProduct)
                    setUserRating(getStoredRating(id));

                    if (authService.isAuthenticated()) {
                        try {
                            const wishlistItems = await WishlistService.getWishlistItems()
                            setIsInWishlist(wishlistItems.some(item => item.id === id))
                        } catch (error) {
                            console.error('Error checking wishlist status:', error)
                            showToastMessage("Failed to check wishlist status", "error")
                        }
                    }

                    // Fetch similar products
                    const similarProducts = await fetchSimilarProducts(fetchedProduct.name)
                    setSuggestedProducts(similarProducts)

                } catch (error) {
                    console.error('Error fetching product:', error)
                    showToastMessage("Failed to fetch product details", "error")
                    setProduct(null)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchProduct()
    }, [id])

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message)
        setToastType(type)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    const handleAddToCart = async () => {
        if (!product || !id) return

        if (!authService.isAuthenticated()) {
            showToastMessage("Please log in to add items to your cart", "error")
            return
        }

        setAddingToCart(true)
        try {
            await cartService.addToCart(id, 1)
            showToastMessage("Added to cart successfully", "success")
        } catch (error) {
            console.error('Error adding to cart:', error)
            showToastMessage("Failed to add item to cart", "error")
        } finally {
            setAddingToCart(false)
        }
    }

    const handleAddToWishlist = async () => {
        if (!product) return

        if (!authService.isAuthenticated()) {
            showToastMessage("Please log in to manage your wishlist", "error")
            return
        }

        try {
            if (isInWishlist) {
                await WishlistService.removeFromWishlist(product.id)
                showToastMessage("Removed from wishlist", "success")
            } else {
                await WishlistService.addToWishlist(product.id)
                showToastMessage("Added to wishlist", "success")
            }
            setIsInWishlist(!isInWishlist)
        } catch (error) {
            console.error('Error updating wishlist:', error)
            showToastMessage("Failed to update wishlist", "error")
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.buttons !== 0) return
        if (imageRef.current) {
            const { left, top, width, height } = imageRef.current.getBoundingClientRect()
            const x = ((e.clientX - left) / width) * 100
            const y = ((e.clientY - top) / height) * 100
            setZoomPosition({ x, y })
        }
    }

    const handleMouseLeave = () => {
        setShowZoom(false)
    }

    const handleBackToStore = () => {
        navigate('/store')
    }

    const handleRating = async (rating: number) => {
        setUserRating(rating);
        if (id) {
            localStorage.setItem(`userRating_${id}`, rating.toString());
            try {
                await ProductService.rateProduct(id, rating);
                showToastMessage("Rating submitted successfully", "success");
                // Optionally, you can fetch the updated product data here
            } catch (error) {
                console.error('Error submitting rating:', error);
                showToastMessage("Failed to submit rating", "error");
            }
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-white dark:bg-neutral-900">
                <div className="animate-pulse">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
                        <div>
                            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
                            <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
                            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-4"></div>
                            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-neutral-600 dark:text-neutral-300">Product not found</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <Toast
                message={toastMessage}
                show={showToast}
                type={toastType}
            />
            <button
                onClick={handleBackToStore}
                className="mb-6 flex items-center text-neutral-600 dark:text-neutral-300 group relative"
            >
                <ArrowLeft className="w-5 h-5 mr-2"/>
                <span className="relative">
                    Back to Store
                    <span
                        className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full group-hover:left-0"/>
                </span>
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="w-full">
                    <div
                        className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-zoom-in"
                        onMouseEnter={() => setShowZoom(true)}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                    >
                        <img
                            ref={imageRef}
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-full h-full"
                        />
                        {showZoom && (
                            <div
                                className="absolute w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-lg pointer-events-none"
                                style={{
                                    left: `${zoomPosition.x}%`,
                                    top: `${zoomPosition.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    backgroundImage: `url(${product.image})`,
                                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    backgroundSize: '1000% 1000%',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                        )}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {product.isNew && (
                                <span className="bg-green-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded shadow-lg">
                                    New Arrival
                                </span>
                            )}
                            {product.discount !== 0 && (
                                <span className="bg-rose-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded shadow-lg">
                                    {product.discount}% OFF
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col text-start">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                            {Array.from({length: Math.floor(product.rating)}).map((_, i) => (
                                <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current"/>
                            ))}
                            {product.rating % 1 !== 0 && (
                                <StarHalf className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current"/>
                            )}
                        </div>
                        <span className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
                            ({product.reviews} reviews)
                        </span>
                    </div>

                    <p className="text-xl sm:text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
                        ${product.price.toFixed(2)}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {product.category.map((cat, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-full text-sm"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full">
                        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full md:w-1/2">
                            <CustomButton
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors duration-200 disabled:bg-rose-400"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2"/>
                                Add to Cart
                            </CustomButton>
                            <CustomButton
                                onClick={handleAddToWishlist}
                                variant="outline"
                                className={`flex-1 flex items-center justify-center py-3 px-4 border-2 w-full ${
                                    isInWishlist
                                        ? 'border-rose-300 dark:border-rose-600 hover:border-rose-400 dark:hover:border-rose-500 text-rose-800 dark:text-rose-200'
                                        : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-800 dark:text-neutral-200'
                                } font-bold rounded-lg transition-colors duration-200`}
                            >
                                <Heart
                                    className={`w-5 h-5 mr-2 ${isInWishlist ? 'fill-current text-rose-500' : ''}`}
                                />
                                {isInWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
                            </CustomButton>
                        </div>

                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                                <ClipboardList className="w-5 h-5 mr-2"/>
                                Product Details
                            </h2>
                            {product.clearance && (
                                <span className="px-3 py-1 text-xs font-medium text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 rounded-full animate-pulse">
                                    Clearance
                                </span>
                            )}
                        </div>

                        <div className="mb-6 text-neutral-600 dark:text-neutral-300">
                            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2 opacity-70"/>
                                About This Product
                            </h3>
                            <p className="text-sm leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <ul className="space-y-4 text-neutral-600 dark:text-neutral-300 text-sm sm:text-base divide-y divide-neutral-200 dark:divide-neutral-700">
                            <li className="flex items-center py-3 group">
                                <span className="w-32 font-medium flex items-center">
                                    <Building2 className="w-4 h-4 mr-2 opacity-70"/>
                                    Brand
                                </span>
                                <span className="flex-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                    {product.brandName}
                                </span>
                            </li>

                            <li className="flex items-center py-3 group">
                                <span className="w-32 font-medium flex items-center">
                                    <ShoppingCart className="w-4 h-4 mr-2 opacity-70"/>
                                    Purchases
                                </span>
                                <span className="flex-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                    {product.purchaseCount.toLocaleString()} units sold
                                </span>
                            </li>

                            <li className="flex items-center py-3 group">
                                <span className="w-32 font-medium flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 opacity-70"/>
                                    Posted Date
                                </span>
                                <span className="flex-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                    {new Date(product.postedDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </li>
                            <li className="flex items-center py-3 group">
                                <span className="w-32 font-medium flex items-center">
                                    <Star className="w-4 h-4 mr-2 opacity-70"/>
                                    Your Rating
                                </span>
                                <span className="flex-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleRating(star)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-6 h-6 ${
                                                        (userRating ?? 0) >= star
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-neutral-300 dark:text-neutral-600'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </span>
                            </li>
                            {product.clearance && (
                                <li className="flex items-center py-3 group">
                                    <span className="w-32 font-medium flex items-center">
                                        <Tag className="w-4 h-4 mr-2 opacity-70"/>
                                        Status
                                    </span>
                                    <span className="flex items-center text-rose-500">
                                        <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"/>
                                        Clearance Item
                                    </span>
                                </li>
                            )}

                            {product.discount !== 0 && (
                                <li className="flex items-center py-3 group">
                                    <span className="w-32 font-medium flex items-center">
                                        <Percent className="w-4 h-4 mr-2 opacity-70"/>
                                        Discount
                                    </span>
                                    <span className="flex items-center text-green-500">
                                        {product.discount}% Off
                                    </span>
                                </li>
                            )}
                        </ul>

                        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
                                <Clock className="w-4 h-4 mr-1"/>
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {suggestedProducts.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">Suggested Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {suggestedProducts.map((suggestedProduct) => (
                            <ProductCard key={suggestedProduct.id} product={suggestedProduct} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

