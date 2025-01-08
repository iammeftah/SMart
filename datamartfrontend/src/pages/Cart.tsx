'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, Truck, Gift, ShoppingBag, Clock, Star, Shield, Zap, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cartService } from '../services/CartService'
import { authService } from '../services/authService'
// import { useRouter } from 'next/navigation'
import { Cart as CartType } from '../types/Cart'
import { useCart } from '../contexts/CartContext'
import axios from 'axios'
import {StripeCheckout} from "../components/StripeCheckout";
import Toast from "../components/Toast";

export default function Cart() {
    // const router = useRouter()
    const queryClient = useQueryClient()
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')
    const { cartItemCount, fetchCartCount } = useCart()
    const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(false)

    const { data: cart, isLoading, error } = useQuery<CartType, Error>({
        queryKey: ['cart'],
        queryFn: cartService.getCart,
        enabled: authService.isAuthenticated(),
        retry: 3,
    })

    const updateCartMutation = useMutation({
        mutationFn: ({ productId, quantity }: { productId: string, quantity: number }) =>
            cartService.updateCartItem(productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            fetchCartCount()
            validateProductAvailability()
        },
    })

    const removeFromCartMutation = useMutation({
        mutationFn: (productId: string) => cartService.removeFromCart(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            showToastMessage("Item removed from cart", "success")
            fetchCartCount()
            validateProductAvailability()
        },
    })

    const handleUpdateQuantity = (productId: string, change: number) => {
        if (!authService.isAuthenticated()) {
            showToastMessage("Please log in to update your cart", "error")
            return
        }
        const currentQuantity = cart?.items?.find(item => item.id === productId)?.quantity || 0
        updateCartMutation.mutate({ productId, quantity: Math.max(0, currentQuantity + change) })
    }

    const handleRemoveItem = (productId: string) => {
        if (!authService.isAuthenticated()) {
            showToastMessage("Please log in to remove items from your cart", "error")
            return
        }
        removeFromCartMutation.mutate(productId)
    }

    const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
        setToastMessage(message)
        setToastType(type)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 5000)
    }

    const validateProductAvailability = async () => {
        if (!cart?.items || cart.items.length === 0) return

        try {
            const response = await axios.post(
                `http://localhost:8082/api/products/validate-availability`,
                cart.items.map(item => ({ productId: item.id, quantity: item.quantity })),
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authService.getToken()}`,
                    },
                }
            )

            const availability = response.data
            const unavailableItems = cart.items.filter(item => !availability[item.id])

            if (unavailableItems.length > 0) {
                const itemNames = unavailableItems.map(item => item.name).join(", ")
                setIsCheckoutDisabled(true)
                showToastMessage(`The following items are not available at the requested quantity: ${itemNames}`, "info")
            } else {
                setIsCheckoutDisabled(false)
            }
        } catch (error) {
            console.error("Error validating product availability:", error)
            showToastMessage("Error checking product availability", "error")
            setIsCheckoutDisabled(true)
        }
    }

    useEffect(() => {
        if (cart?.items) {
            validateProductAvailability()
        }
    }, [cart])

    if (!authService.isAuthenticated()) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-168px)] bg-neutral-50 dark:bg-neutral-900">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                    <h2 className="text-2xl font-semibold mb-2 text-neutral-700 dark:text-neutral-200">Please log in to view your cart</h2>
                    <a
                        href="/account"
                        className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors inline-block"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-rose-500 animate-bounce" />
                    <h2 className="text-2xl font-semibold mb-2 text-neutral-700 dark:text-neutral-200">Loading...</h2>
                    <div className="w-64 h-2 bg-neutral-200 rounded-full mx-auto overflow-hidden">
                        <div className="w-1/3 h-full bg-rose-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-rose-500" />
                    <h2 className="text-2xl font-semibold mb-2 text-neutral-700 dark:text-neutral-200">Error loading cart</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                        {error.message || "An unexpected error occurred"}
                    </p>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['cart'] })}
                        className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    const subtotal = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    const shipping = subtotal > 100 ? 0 : 10
    const total = subtotal + shipping

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
            <div className="container mx-auto px-4 py-8">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center"
                >
                    <ShoppingCart className="mr-2" /> Your Cart
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        <AnimatePresence>
                            {cart?.items?.length === 0 ? (
                                <motion.div
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -20}}
                                    className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 md:p-8 text-center"
                                >
                                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-neutral-400 dark:text-neutral-600"/>
                                    <h2 className="text-xl md:text-2xl font-semibold mb-2">Your cart is empty</h2>
                                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                        Looks like you haven't added any items to your cart yet.
                                    </p>
                                    <a
                                        href="/store"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
                                    >
                                        <ArrowLeft className="mr-2"/> Start Shopping
                                    </a>
                                </motion.div>
                            ) : (
                                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden">
                                    {cart?.items?.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -20}}
                                            className={`flex flex-col md:flex-row items-start md:items-center p-4 ${index !== cart.items.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`}
                                        >
                                            <img src={item.image} alt={item.name}
                                                 className="w-full md:w-20 h-40 md:h-20 object-cover rounded-md mb-4 md:mb-0 md:mr-4"/>
                                            <div className="flex-grow mb-4 md:mb-0">
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-neutral-600 dark:text-neutral-400">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center justify-between w-full md:w-auto">
                                                <div className="flex items-center">
                                                    <button
                                                        className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                        onClick={() => handleUpdateQuantity(item.id, -1)}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-4 h-4"/>
                                                    </button>
                                                    <span className="mx-2 w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                        onClick={() => handleUpdateQuantity(item.id, 1)}
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                                <button
                                                    className="ml-4 p-1 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 lg:sticky lg:top-20">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <StripeCheckout cartTotal={total} isDisabled={isCheckoutDisabled} />

                            {/* Additional Information */}
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                                    <Truck className="mr-2 flex-shrink-0" />
                                    <span className="text-start">{subtotal > 100 ? 'Free shipping on your order' : 'Free shipping on orders over $100'}</span>
                                </div>
                                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                                    <Shield className="mr-2 flex-shrink-0" />
                                    <span className="text-start">Secure checkout powered by Stripe</span>
                                </div>
                                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                                    <Zap className="mr-2 flex-shrink-0" />
                                    <span className="text-start">Lightning-fast delivery with our premium shipping partners</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast
                message={toastMessage}
                show={showToast}
                type={toastType}
            />
        </div>
    )
}

