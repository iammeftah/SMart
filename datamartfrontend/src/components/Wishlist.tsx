import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Product } from '../Interfaces/Product'
import { CustomButton } from './CustomButton'
import { WishlistService } from "../services/WishlistService"
import { useNavigate } from "react-router-dom"
import { Modal } from './Modal'
import { authService } from '../services/authService'
import Toast from './Toast'

interface WishlistProps {
    isOpen: boolean
    onClose: () => void
}

const Wishlist: React.FC<WishlistProps> = ({ isOpen, onClose }) => {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalConfig, setModalConfig] = useState<{
        title: string
        message: string
        onConfirm: () => void
    }>({
        title: '',
        message: '',
        onConfirm: () => {},
    })
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastType, setToastType] = useState<'success' | 'error'>('error')
    const navigate = useNavigate()

    const showToastMessage = (message: string, type: 'success' | 'error' = 'error') => {
        setToastMessage(message)
        setToastType(type)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    useEffect(() => {
        const fetchWishlistItems = async () => {
            if (!authService.isAuthenticated()) {
                setError('Please log in to view your wishlist')
                return
            }
            setIsLoading(true)
            try {
                const items = await WishlistService.getWishlistItems()
                setWishlistItems(items)
                setError(null)
            } catch (error) {
                console.error('Error fetching wishlist items:', error)
                setError('Failed to fetch wishlist items')
                setWishlistItems([])
            } finally {
                setIsLoading(false)
            }
        }

        if (isOpen) {
            fetchWishlistItems()
        }
    }, [isOpen])

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false)
    }, [])

    const handleRemoveFromWishlist = useCallback((productId: string, productName: string) => {
        if (!authService.isAuthenticated()) {
            showToastMessage('Please log in to manage your wishlist', 'error')
            return
        }

        if (!productId) {
            console.error('Product ID is undefined')
            setError('Cannot remove item: Invalid product ID')
            return
        }

        setModalConfig({
            title: 'Remove Item',
            message: `Are you sure you want to remove "${productName}" from your wishlist?`,
            onConfirm: async () => {
                setIsRefreshing(true)
                try {
                    await WishlistService.removeFromWishlist(productId)
                    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId))
                    setError(null)
                    handleModalClose()
                    showToastMessage('Item removed from wishlist', 'success')
                } catch (error) {
                    console.error('Error removing item from wishlist:', error)
                    showToastMessage('Failed to remove item from wishlist', 'error')
                } finally {
                    setIsRefreshing(false)
                }
            },
        })
        setIsModalOpen(true)
    }, [handleModalClose])

    const handleClearWishlist = useCallback(() => {
        if (!authService.isAuthenticated()) {
            showToastMessage('Please log in to manage your wishlist', 'error')
            return
        }

        if (wishlistItems.length === 0) return

        setModalConfig({
            title: 'Clear Wishlist',
            message: 'Are you sure you want to remove all items from your wishlist?',
            onConfirm: async () => {
                setIsRefreshing(true)
                try {
                    await WishlistService.clearAll()
                    setWishlistItems([])
                    setError(null)
                    handleModalClose()
                    showToastMessage('Wishlist cleared successfully', 'success')
                } catch (error) {
                    console.error('Error clearing wishlist:', error)
                    showToastMessage('Failed to clear wishlist', 'error')
                } finally {
                    setIsRefreshing(false)
                }
            },
        })
        setIsModalOpen(true)
    }, [wishlistItems.length, handleModalClose])

    const handleProductClick = useCallback((productId: string) => {
        navigate(`/product/${productId}`)
        onClose()
    }, [navigate, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-neutral-900 z-50 overflow-hidden flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Wishlist</h2>
                                <div className="flex items-center gap-2">
                                    {wishlistItems.length > 0 && (
                                        <button
                                            onClick={handleClearWishlist}
                                            className="text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors duration-200"
                                        >
                                            <span className="text-sm">Clear All</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-neutral-400 hover:text-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 relative">
                            {isRefreshing && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                                </div>
                            )}
                            {error && (
                                <p className="text-center text-rose-500 dark:text-rose-400 mb-4">{error}</p>
                            )}
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                                </div>
                            ) : wishlistItems.length === 0 ? (
                                <p className="text-center text-neutral-500 dark:text-neutral-400">Your wishlist is empty</p>
                            ) : (
                                wishlistItems.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 mb-4 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200" onClick={() => item.id && handleProductClick(item.id)}>
                                        <div className="flex-1 flex items-center space-x-4">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                            <div className="flex-1 text-start">
                                                <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{item.name}</h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">${item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <CustomButton
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (!item.id) {
                                                    console.error('Missing ID for item:', item)
                                                    return
                                                }
                                                handleRemoveFromWishlist(item.id, item.name)
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 mr-2 duration-200"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </CustomButton>
                                    </div>
                                ))
                            )}
                        </div>
                        <Modal
                            isOpen={isModalOpen}
                            onClose={handleModalClose}
                            title={modalConfig.title}
                            message={modalConfig.message}
                            icon={<AlertTriangle className="size-6 text-rose-600" />}
                            primaryButton={{
                                label: 'Confirm',
                                onClick: modalConfig.onConfirm,
                                variant: 'danger'
                            }}
                            secondaryButton={{
                                label: 'Cancel',
                                onClick: handleModalClose,
                                variant: 'secondary'
                            }}
                        />
                    </motion.div>
                </>
            )}

            <Toast message={toastMessage} show={showToast} type={toastType}/>
        </AnimatePresence>
    )
}

export default Wishlist

