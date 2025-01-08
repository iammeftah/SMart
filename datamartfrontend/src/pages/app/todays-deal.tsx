'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Product } from '../../Interfaces/Product'
import { useProductData } from './useProductData'
import { ProductCard } from '../../components/ProductCard'
import { ProductCardSkeleton } from '../../components/ProductCardSkeleton'

export default function TodaysDealsPage() {
    const { allProducts, loading, error } = useProductData()
    const [todaysDeals, setTodaysDeals] = useState<Product[]>([])

    useEffect(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const filtered = allProducts.filter(product => {
            const productDate = new Date(product.postedDate)
            productDate.setHours(0, 0, 0, 0)
            return productDate.getTime() === today.getTime()
        })
        setTodaysDeals(filtered)
    }, [allProducts])

    if (error) return <div>Error: {error}</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-start text-black dark:text-white text-3xl font-bold mb-8 ">Today's Deals</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProductCardSkeleton key={`skeleton-${index}`} />
                        ))
                    ) : todaysDeals.length === 0 ? (
                        <p className="text-center text-neutral-600 col-span-full">No deals available today. Check back tomorrow!</p>
                    ) : (
                        todaysDeals.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
