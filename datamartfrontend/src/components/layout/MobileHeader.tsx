'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Search, ShoppingCart, Menu, User, Home, X, Bell, Heart, Globe, ChevronDown, Clock, Store } from 'lucide-react'
import { DarkModeToggler } from './Header'
import { categories } from '../../Mock/category'
import Wishlist from '../Wishlist'
import { AccountDropdown } from "../AccountDropdown"
import { ProductService } from '../../services/productsService'
import { Product } from '../../Interfaces/Product'


interface CategoryMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 dark:bg-white/20"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed left-0 top-0 w-full sm:w-80 bg-white dark:bg-neutral-900 h-full z-50 overflow-auto flex flex-col"
                        initial={{x: '-100%'}}
                        animate={{x: 0}}
                        exit={{x: '-100%'}}
                        transition={{type: "spring", damping: 30}}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Menu</h2>
                            <button onClick={onClose} className="outline-none p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300">
                                <X className="w-6 h-6"/>
                            </button>
                        </div>
                        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Categories</h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            to={`/category/${category.id}`}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400"
                                            onClick={onClose}
                                        >
                                            <category.icon className="w-5 h-5"/>
                                            <span>{category.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Account</h3>
                                <div className="space-y-2">
                                    <Link to="/store" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400" onClick={onClose}>
                                        <Store className="w-5 h-5"/>
                                        <span>Market</span>
                                    </Link>
                                    <Link to="/account" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400" onClick={onClose}>
                                        <User className="w-5 h-5"/>
                                        <span>My Account</span>
                                    </Link>
                                    <button onClick={() => { setIsWishlistOpen(true); onClose(); }} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400">
                                        <Heart className="w-5 h-5"/>
                                        <span>Wishlist</span>
                                    </button>
                                    <Link to="/cart" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400" onClick={onClose}>
                                        <ShoppingCart className="w-5 h-5"/>
                                        <span>Cart</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
            <Wishlist isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </AnimatePresence>
    )
}

const SearchOverlay: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const navigate = useNavigate()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (searchQuery.length > 2) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
            searchTimeoutRef.current = setTimeout(async () => {
                setIsSearching(true)
                try {
                    const results = await ProductService.searchProducts(searchQuery)
                    setSearchResults(results)
                } catch (error) {
                    console.error('Error searching products:', error)
                } finally {
                    setIsSearching(false)
                }
            }, 300)
        } else {
            setSearchResults([])
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-white dark:bg-neutral-900 z-50"
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: "spring", damping: 30 }}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <form onSubmit={handleSearch} className="flex-1 flex items-center">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for anything..."
                                    className="w-full bg-transparent text-lg text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none"
                                    autoFocus
                                />
                            </form>
                            <button
                                onClick={onClose}
                                className="ml-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {isSearching && (
                            <div className="p-4 text-center">
                                Searching...
                            </div>
                        )}
                        {!isSearching && searchResults.length > 0 && (
                            <div className="flex-1 overflow-y-auto">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="flex items-center px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        onClick={onClose}
                                    >
                                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                                        <div>
                                            <div className="font-semibold text-neutral-900 dark:text-white">{product.name}</div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">{product.brandName}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const MobileHeader: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [cartItemCount, setCartItemCount] = useState(0)
    const { scrollY } = useScroll()
    const headerHeight = useTransform(scrollY, [0, 50], ['64px', '64px'])

    useEffect(() => {
        const fetchCartItems = () => {
            const itemCount = Math.floor(Math.random() * 10)
            setCartItemCount(itemCount)
        }

        fetchCartItems()
    }, [])

    return (
        <>
            <motion.nav
                className="fixed left-0 right-0 bottom-0 z-40 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 md:hidden"
                style={{ height: headerHeight }}
            >
                <div className="flex items-center justify-around h-full px-4">
                    <Link
                        to="/"
                        className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400"
                        aria-label="Home"
                    >
                        <Home className="w-6 h-6" />
                    </Link>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400"
                        aria-label="Search"
                    >
                        <Search className="w-6 h-6" />
                    </button>
                    <Link
                        to="/cart"
                        className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 relative"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-rose-600 rounded-full">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>
                    <AccountDropdown />
                    <DarkModeToggler />
                </div>
            </motion.nav>

            <CategoryMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    )
}

export default MobileHeader

