import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { Product } from '../Interfaces/Product'
import { ProductCard } from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/ProductCardSkeleton'
import { Filter, X, ChevronUp, ChevronDown } from 'lucide-react'
import {CustomButton} from "../components/CustomButton";
import {ProductService } from '../services/productsService'
import { CategoryService } from '../services/categoryService'
import {Brand } from '../Interfaces/Brand'
import { Category } from '../Interfaces/Category'
import { BrandService } from '../services/brandService'

interface FilterState {
    brand: string[]
    price: { min: number; max: number }
    rating: number
    availability: boolean
}

export const CustomCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <label className="flex items-center space-x-3 cursor-pointer group">
        <div
            className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                checked ? 'bg-primary border-primary' : 'border-neutral-300 dark:border-neutral-600 group-hover:border-primary'
            } focus:outline-none `}
            onClick={(e) => {
                e.preventDefault()
                onChange()
            }}
            tabIndex={0}
            role="checkbox"
            aria-checked={checked}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange()
                }
            }}
        >
            {checked && <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-300  rounded-full" />}
        </div>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors duration-200">{label}</span>
    </label>
)

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>()
    const [loading, setLoading] = useState(true)
    const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<FilterState>(() => ({
        brand: [],
        price: { min: 0, max: 1000 },
        rating: 0,
        availability: false,
    }))
    const [sortBy, setSortBy] = useState('featured')
    const [brands, setBrands] = useState<Brand[]>([])
    const [category, setCategory] = useState<Category | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [allProducts, allBrands, allCategories] = await Promise.all([
                    ProductService.getAllProducts(),
                    BrandService.getAllBrands(),
                    CategoryService.getAllCategories()
                ])

                const currentCategory = allCategories.find(c => c.id === slug)
                setCategory(currentCategory || null)

                const filtered = allProducts.filter((product) =>
                    product.category.includes(slug || '')
                )
                setCategoryProducts(filtered)
                setFilteredProducts(filtered)
                setBrands(allBrands)

                // Update price range based on actual product prices
                const prices = filtered.map(p => p.price)
                setFilters(prev => ({
                    ...prev,
                    price: { min: Math.min(...prices), max: Math.max(...prices) }
                }))
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [slug])

    useEffect(() => {
        let result = categoryProducts.filter(product => {
            return (
                (filters.brand.length === 0 || filters.brand.includes(product.brandName)) &&
                (product.price >= filters.price.min && product.price <= filters.price.max) &&
                (filters.rating === 0 || product.rating >= filters.rating) &&
                (!filters.availability || product.isNew)
            )
        })

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
                break
            case 'price-asc':
                result.sort((a, b) => a.price - b.price)
                break
            case 'price-desc':
                result.sort((a, b) => b.price - a.price)
                break
            case 'rating':
                result.sort((a, b) => b.rating - a.rating)
                break
            default:
                result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        }

        setFilteredProducts(result)
    }, [filters, sortBy, categoryProducts])

    const FilterSidebar = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-start font-semibold mb-4">Availability</h3>
                <CustomCheckbox
                    checked={filters.availability}
                    onChange={() => setFilters(prev => ({...prev, availability: !prev.availability}))}
                    label="In Stock Only"
                />
            </div>
            <div>
                <h3 className="text-start font-semibold mb-4">Brands</h3>
                <div className="space-y-3">
                    {brands.map((brand) => (
                        <CustomCheckbox
                            key={brand.id}
                            checked={filters.brand.includes(brand.name)}
                            onChange={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    brand: prev.brand.includes(brand.name)
                                        ? prev.brand.filter(name => name !== brand.name)
                                        : [...prev.brand, brand.name]
                                }))
                            }}
                            label={brand.name}
                        />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-start font-semibold mb-4">Price Range</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <label htmlFor="min-price"
                               className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Min</label>
                        <input
                            type="number"
                            id="min-price"
                            value={filters.price.min}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                price: {...prev.price, min: Number(e.target.value)}
                            }))}
                            className="w-full h-10 px-3 rounded-full bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 no-spinners"
                            min="0"
                            max={filters.price.max}
                        />
                        <div className="absolute right-2 top-[25px] flex flex-col">
                            <button
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    price: {
                                        ...prev.price,
                                        min: Math.min(prev.price.min + 1, prev.price.max)
                                    }
                                }))}
                                className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                            >
                                <ChevronUp className="h-4 w-4"/>
                            </button>
                            <button
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    price: {
                                        ...prev.price,
                                        min: Math.max(prev.price.min - 1, 0)
                                    }
                                }))}
                                className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                            >
                                <ChevronDown className="h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <label htmlFor="max-price"
                               className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Max</label>
                        <input
                            type="number"
                            id="max-price"
                            value={filters.price.max}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                price: {...prev.price, max: Number(e.target.value)}
                            }))}
                            className="w-full h-10 px-3 rounded-full bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 no-spinners"
                            min={filters.price.min}
                        />
                        <div className="absolute right-2 top-[25px] flex flex-col">
                            <button
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    price: {
                                        ...prev.price,
                                        max: prev.price.max + 1
                                    }
                                }))}
                                className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                            >
                                <ChevronUp className="h-4 w-4"/>
                            </button>
                            <button
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    price: {
                                        ...prev.price,
                                        max: Math.max(prev.price.max - 1, prev.price.min)
                                    }
                                }))}
                                className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                            >
                                <ChevronDown className="h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-start font-semibold mb-4">Rating</h3>
                <div className="flex items-center justify-between">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <CustomButton
                            key={rating}
                            variant={filters.rating === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilters(prev => ({...prev, rating: prev.rating === rating ? 0 : rating}))}
                            className="w-10 h-10 flex items-center justify-center text-lg font-semibold"
                        >
                            {rating}
                        </CustomButton>
                    ))}
                </div>
            </div>
        </div>
    )

    if (!category) {
        return <div>Category not found</div>
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-black dark:text-white text-start text-3xl font-bold mb-8">{category.name}</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-20">
                            <div className="hidden md:block">
                                <FilterSidebar/>
                            </div>
                            <button
                                className="w-full md:hidden bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white px-4 py-2 rounded-lg shadow-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4 mr-2 inline-block" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1">
                        {/* Active Filters */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.brand.map((brandName) => (
                                <button
                                    key={brandName}
                                    onClick={() => setFilters(prev => ({
                                        ...prev,
                                        brand: prev.brand.filter(name => name !== brandName)
                                    }))}
                                    className="px-3 py-1 text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200"
                                >
                                    {brandName}
                                    <X className="ml-2 h-3 w-3 inline-block" />
                                </button>
                            ))}
                            {filters.rating > 0 && (
                                <button
                                    onClick={() => setFilters(prev => ({...prev, rating: 0}))}
                                    className="px-3 py-1 text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200"
                                >
                                    {filters.rating}+ Stars
                                    <X className="ml-2 h-3 w-3 inline-block" />
                                </button>
                            )}
                            {filters.availability && (
                                <button
                                    onClick={() => setFilters(prev => ({...prev, availability: false}))}
                                    className="px-3 py-1 text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200"
                                >
                                    In Stock Only
                                    <X className="ml-2 h-3 w-3 inline-block" />
                                </button>
                            )}
                            {(filters.brand.length > 0 || filters.rating > 0 || filters.availability) && (
                                <button
                                    onClick={() => {
                                        setFilters({
                                            brand: [],
                                            price: {min: 0, max: 1000},
                                            rating: 0,
                                            availability: false,
                                        })
                                    }}
                                    className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Mobile Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="md:hidden mb-6 overflow-hidden"
                                >
                                    <FilterSidebar />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center text-neutral-500 dark:text-neutral-400 mt-8">
                                <p className="text-xl">No products found.</p>
                                <p className="mt-2">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

