'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { Search, ShoppingCart, ChevronDown, User, Globe, Heart, Bell, X, Moon, Sun, Laptop, Smartphone, Clock, Loader } from 'lucide-react'
import MobileHeader from './MobileHeader'
import Wishlist from '../Wishlist'
import StoreNavigation from '../StoreNavigation'
import { cartService } from '../../services/CartService'
import { AccountButton } from '../AccountButton'
import {ProductService} from "../../services/productsService";
import {BrandService} from "../../services/brandService";
import {CategoryService} from "../../services/categoryService";
import {Category} from "../../Interfaces/Category";
import { Product } from "../../Interfaces/Product"
import {authService} from "../../services/authService";

interface CategoryMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categories] = await Promise.all([
                    CategoryService.getAllCategories()
                ])

                setCategories(categories)
            } catch (error) {
                console.error('Error loading categories:', error)
            }
        }

        fetchData()
    }, [])
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 dark:bg-white/20"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed left-0 top-0 w-full sm:w-80 bg-white dark:bg-neutral-900 h-full z-50 overflow-auto"
                        initial={{x: '-100%'}}
                        animate={{x: 0}}
                        exit={{x: '-100%'}}
                        transition={{type: "spring", damping: 30}}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Categories</h2>
                            <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300">
                                <X className="w-6 h-6"/>
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/category/${category.id}`}
                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400"
                                >
                                    {/* <category.icon className="w-6 h-6"/> */}
                                    <span>{category.name}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

type ThemeMode = 'light' | 'dark' | 'system'

export const DarkModeToggler: React.FC = () => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('system')

    useEffect(() => {
        const storedTheme = localStorage.getItem('themeMode') as ThemeMode | null
        if (storedTheme) {
            setThemeMode(storedTheme)
        }
        updateTheme(storedTheme || 'system')

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
            if (themeMode === 'system') {
                document.documentElement.classList.toggle('dark', mediaQuery.matches)
            }
        }

        mediaQuery.addEventListener('change', handleChange)

        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [themeMode])

    const updateTheme = (mode: ThemeMode) => {
        if (mode === 'system') {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
            document.documentElement.classList.toggle('dark', isDarkMode)
        } else {
            document.documentElement.classList.toggle('dark', mode === 'dark')
        }
        localStorage.setItem('themeMode', mode)
    }

    const toggleTheme = () => {
        const newMode: ThemeMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light'
        setThemeMode(newMode)
        updateTheme(newMode)
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400"
            aria-label="Toggle theme"
        >
            {themeMode === 'light' && <Sun className="w-6 h-6" />}
            {themeMode === 'dark' && <Moon className="w-6 h-6" />}
            {themeMode === 'system' && (
                <div className="hidden sm:block">
                    <Laptop className="w-6 h-6" />
                </div>
            )}
            {themeMode === 'system' && (
                <div className="block sm:hidden">
                    <Smartphone className="w-6 h-6" />
                </div>
            )}
        </button>
    )
}



const Header: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = () => {
            const adminStatus = authService.isAdmin();
            console.log('Admin status:', adminStatus);
            setIsAdmin(adminStatus);
        };

        checkAdminStatus();

        // Check admin status every 5 seconds (for debugging purposes)
        const interval = setInterval(checkAdminStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)
    const [searchTerm, setsearchTerm] = useState('')
    const navigate = useNavigate()
    const headerRef = useRef<HTMLDivElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    const { scrollY } = useScroll()
    const initialHeaderHeight = 168
    const finalHeaderHeight = 64
    const scrollRange = initialHeaderHeight - finalHeaderHeight

    const headerHeight = useSpring(
        useTransform(scrollY, [0, scrollRange], [initialHeaderHeight, finalHeaderHeight]),
        { stiffness: 400, damping: 30 }
    )

    const topBarOpacity = useTransform(scrollY, [0, scrollRange * 0.3], [1, 0])
    const navBarOpacity = useTransform(scrollY, [scrollRange * 0.7, scrollRange], [1, 0])
    const mainBarHeight = useTransform(scrollY, [0, scrollRange], [80, finalHeaderHeight])
    const logoScale = useTransform(scrollY, [0, scrollRange], [1, 0.8])
    const searchBarWidth = useTransform(scrollY, [0, scrollRange], ['100%', '200px'])
    const mainBarPadding = useTransform(scrollY, [0, scrollRange], [16, 0])

    const [searchResults, setSearchResults] = useState<Product[]>([]);
    // Add state for additional search filters
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        try {
            const results = await ProductService.searchProducts(
                searchTerm,
                selectedCategory,
                minPrice,
                maxPrice
            );
            setSearchResults(results);

            // Optional: Navigate to search results page
            if (results.length > 0) {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            }
        } catch (error) {
            console.error('Search failed', error);
        }
    };


    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                const currentScrollY = window.scrollY
                const progress = Math.min(currentScrollY / scrollRange, 1)
                const newHeight = initialHeaderHeight - progress * (initialHeaderHeight - finalHeaderHeight)
                headerRef.current.style.height = `${newHeight}px`
            }
        }

        window.addEventListener('scroll', updateHeaderHeight)
        return () => window.removeEventListener('scroll', updateHeaderHeight)
    }, [])

    useEffect(() => {
        if (searchTerm.length > 2) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
            setIsSearching(true)
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const results = await ProductService.searchProducts(searchTerm)
                    setSearchResults(results)
                } catch (error) {
                    console.error('Error searching products:', error)
                    setSearchResults([])
                } finally {
                    // Ensure the loading state is shown for at least 500ms
                    setTimeout(() => setIsSearching(false), 500)
                }
            }, 300)
        } else {
            setSearchResults([])
            setIsSearching(false)
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchTerm])

    const [cartItemCount, setCartItemCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                setIsLoading(true);
                const cart = await cartService.getCart();
                const count = cart.items.reduce((total, item) => total + item.quantity, 0);
                setCartItemCount(count);

            } catch (error) {
                console.error('Failed to fetch cart count:', error);
                setCartItemCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCartCount();
    }, [])

    return (
        <>
            <div className="hidden md:block ">
                <motion.header
                    ref={headerRef}
                    className="fixed left-0 right-0 z-40 bg-white dark:bg-neutral-900 flex flex-col md:top-0"
                    style={{ height: headerHeight }}
                >
                    <motion.div
                        className="border-b border-neutral-200 dark:border-neutral-700 overflow-hidden"
                        style={{ opacity: topBarOpacity, height: 40 }}
                    >
                        <div className="container mx-auto px-4">
                            <div className="flex items-center justify-between h-10 text-sm">
                                <div className="flex items-center space-x-4">
                                    <a href="#" className="flex outline-none items-center space-x-1 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                        <Clock className="w-4 h-4" />
                                        <span>App will be available soon</span>
                                    </a>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <a href="/about" className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">About SMart</a>
                                    {isAdmin && (
                                        <a href="/product-manage" className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                            Inventory
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="flex-grow" style={{
                        height: mainBarHeight,
                        paddingTop: mainBarPadding,
                        paddingBottom: mainBarPadding
                    }}>
                        <div className="container mx-auto px-4 h-full">
                            <div className="flex items-center justify-between h-full">
                                <div className="flex items-center justify-between w-full md:w-auto md:space-x-4">
                                    <motion.a
                                        href="/"
                                        className="flex-shrink-0 text-2xl font-bold text-rose-600 dark:text-rose-400 hidden md:block"
                                        style={{scale: logoScale}}
                                    >
                                        SMart.
                                    </motion.a>
                                </div>

                                <motion.form
                                    onSubmit={handleSearch}
                                    className="hidden md:block flex-1 max-w-2xl mx-6 relative"
                                    style={{width: searchBarWidth}}
                                >
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setsearchTerm(e.target.value)}
                                            placeholder="Search for anything..."
                                            className="w-full h-11 pl-4 pr-12 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute outline-none right-0 top-0 h-full px-4 text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors"
                                        >
                                            {isSearching ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Search className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {searchTerm.length > 2 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="flex items-center justify-center p-4">
                                                    <Loader className="w-6 h-6 text-rose-600 animate-spin mr-2" />
                                                    <span className="text-neutral-600 dark:text-neutral-400">Searching...</span>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        to={`/product/${product.id}`}
                                                        className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                        onClick={() => setSearchResults([])}
                                                    >
                                                        <div className="flex items-center">
                                                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                                                            <div>
                                                                <div className="text-start font-semibold text-neutral-900 dark:text-white">{product.name}</div>
                                                                <div className="text-start text-sm text-neutral-500 dark:text-neutral-400">{product.brandName}</div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-neutral-500 dark:text-neutral-400">No results found</div>
                                            )}
                                        </div>
                                    )}
                                </motion.form>

                                <div className="hidden md:flex items-center space-x-1 md:space-x-2">
                                    <DarkModeToggler/>
                                    <button
                                        className="p-2 outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400"
                                        onClick={() => setIsWishlistOpen(true)}
                                    >
                                        <Heart className="w-6 h-6"/>
                                    </button>
                                    <AccountButton />
                                    <Link
                                        to="/cart"
                                        className="p-2 outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 relative"
                                    >
                                        <ShoppingCart className="w-6 h-6"/>
                                        {cartItemCount > 0 && (
                                            <span
                                                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-rose-600 rounded-full">
                                                {cartItemCount}
                                            </span>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <StoreNavigation navBarOpacity={navBarOpacity}/>
                </motion.header>

                <CategoryMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}/>
                <Wishlist isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)}/>
            </div>
            <div className="block md:hidden">
                <MobileHeader/>
            </div>
        </>
    )
}

export default Header

