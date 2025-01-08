import { useState, useMemo, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ShoppingCart, Search, Zap, Bot, TrendingUp, ShieldCheck, ChevronRight, Sparkles, Gift, ArrowRight, Star, Clock, Shield } from 'lucide-react'
import Robot from '../components/Robot'
import { ProductCard } from '../components/ProductCard'
import { Product } from '../Interfaces/Product'
import {ProductService} from "../services/productsService";

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true)
                const data = await ProductService.getAllProducts()
                setProducts(data)
                setError(null)
            } catch (err) {
                setError('Failed to fetch products. Please try again later.')
                console.error('Error fetching products:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const trendyProducts = useMemo(() => {
        if (!products.length) return []
        return products
            .filter(product => new Date(product.postedDate) >= oneWeekAgo)
            .sort((a, b) => b.purchaseCount - a.purchaseCount)
            .slice(0, 4)
    }, [products])

    const featuredProducts = useMemo(() => {
        if (!products.length) return []
        return products
            .filter(product => product.isFeatured)
            .sort((a, b) => b.purchaseCount - a.purchaseCount)
            .slice(0, 4)
    }, [products])

    const mostSoldProduct = useMemo(() => {
        if (!products.length) return null
        return products.reduce((prev, current) =>
            (prev.purchaseCount > current.purchaseCount) ? prev : current
        )
    }, [products])

    const recommendations = useMemo(() => {
        if (!mostSoldProduct || !products.length) return []
        return products
            .filter(product =>
                product.id !== mostSoldProduct.id &&
                product.category.some(cat => mostSoldProduct.category.includes(cat))
            )
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
    }, [products, mostSoldProduct])

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-rose-600 mb-4">Error</h2>
                    <p className="text-neutral-700 dark:text-neutral-300">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                    <p className="text-neutral-700 dark:text-neutral-300">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
            {/* Hero Section */}
            <section className="relative flex items-center h-screen md:h-auto overflow-hidden bg-gradient-to-r from-rose-600 to-fuchsia-700 dark:from-rose-800 dark:to-fuchsia-900 py-16 sm:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-4"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-start">
                                Shop Smarter with
                                <span className="text-yellow-300"> AI-Powered</span> Recommendations
                            </h1>
                            <p className="text-lg text-rose-100 text-start">
                                Experience personalized shopping like never before. Our AI learns your preferences to
                                show you products you'll love.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="/store">
                                    <motion.button
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        className="outline-none w-full px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-rose-900 rounded-full font-medium transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <span>Start Shopping</span>
                                        <ArrowRight className="w-5 h-5"/>
                                    </motion.button>
                                </a>
                            </div>
                        </div>
                        <motion.div
                            initial={{opacity: 0, x: 30}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.8, delay: 0.2}}
                            className="relative hidden md:block"
                        >
                            <Robot/>
                            <div className="sm:hover:scale-110 sm:hover:translate-x-[2rem] hover:scale-100 hover:translate-x-[0rem] duration-200">
                                <motion.div
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.8, delay: 0.4}}
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg flex items-center space-x-3 sm:absolute sm:bottom-[-24px] sm:left-[-24px] sm:translate-x-0 sm:justify-start transform-origin-bottom-left"
                                >
                                    <Bot className="w-8 h-8 text-rose-600"/>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">AI Assistant</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Always here to help</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Trendy Products Section */}
            <section className="py-16 bg-neutral-100 dark:bg-neutral-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
                        Trending Now
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trendyProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-white dark:bg-neutral-800">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
                        Featured Products
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Most Sold Product of the Month Section */}
            {mostSoldProduct && (
                <section className="py-16 bg-neutral-100 dark:bg-neutral-900">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
                            Product of the Month
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <ProductCard product={mostSoldProduct} />
                            </div>
                            <div className="lg:col-span-2">
                                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                                    Recommended with this product
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                                    Our AI suggests these items to complement your purchase:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {recommendations.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-rose-600 to-fuchsia-700 dark:from-rose-800 dark:to-fuchsia-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-4 text-center"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Ready to Experience Smart Shopping?
                    </h2>
                    <p className="text-rose-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who've discovered the power of AI-driven shopping recommendations.
                    </p>
                    <a href="/store">
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className="outline-none px-8 py-4 bg-white hover:bg-neutral-100 text-rose-600 rounded-full font-medium transition-colors inline-flex items-center space-x-2"
                        >
                            <span>Get Started Now</span>
                            <ChevronRight className="w-5 h-5"/>
                        </motion.button>
                    </a>
                </motion.div>
            </section>
        </div>
    )
}