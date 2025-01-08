'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronDown,
    X,
    Filter,
    ChevronUp
} from 'lucide-react'
import { Product } from '../Interfaces/Product'
import { Brand } from '../Interfaces/Brand'
import { CustomButton } from '../components/CustomButton'
import { ProductCard } from '../components/ProductCard'
import Chatbot from '../components/Chatbot'
import {Category} from "../Interfaces/Category";
import {ProductService} from "../services/productsService";
import {BrandService} from "../services/brandService";
import {CategoryService} from "../services/categoryService";
import { CustomCheckbox } from './CategoryPage'

interface FilterState {
    category: string[]
    brand: string[]
    price: { min: number; max: number }
    rating: number
    availability: boolean
}




const ProductCardSkeleton = () => (
    <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        transition={{duration: 0.5}}
        className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-lg w-full  h-auto"
    >
        <div className="relative aspect-square">
            <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"/>
            <div className="absolute top-2 right-2 flex flex-row gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-300 dark:bg-neutral-600 animate-pulse"/>
                <div className="w-8 h-8 rounded-lg bg-neutral-300 dark:bg-neutral-600 animate-pulse"/>
            </div>
        </div>
        <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-24 h-4 bg-neutral-300 dark:bg-neutral-600 animate-pulse rounded"/>
            </div>
            <div className="w-full h-5 bg-neutral-300 dark:bg-neutral-600 animate-pulse rounded mb-2"/>
            <div className="w-3/4 h-5 bg-neutral-300 dark:bg-neutral-600 animate-pulse rounded mb-4"/>
            <div className="flex items-center justify-between">
                <div className="w-20 h-6 bg-neutral-300 dark:bg-neutral-600 animate-pulse rounded"/>
                <div className="w-16 h-6 bg-neutral-300 dark:bg-neutral-600 animate-pulse rounded"/>
            </div>
        </div>
    </motion.div>
)

export default function Store() {
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState<FilterState>(() => {
        // Try to load filters from localStorage
        const savedFilters = localStorage.getItem('storeFilters')
        return savedFilters ? JSON.parse(savedFilters) : {
            category: [],
            brand: [],
            price: {min: 0, max: 1000 },
            rating: 0,
            availability: false,
        }
    })
    const [sortBy] = useState(() => {
        // Try to load sortBy from localStorage
        return localStorage.getItem('storeSortBy') || 'featured'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, brandsData, categoriesData] = await Promise.all([
                    ProductService.getAllProducts(),
                    BrandService.getAllBrands(),
                    CategoryService.getAllCategories()
                ])
                setProducts(productsData)
                setBrands(brandsData)
                setCategories(categoriesData)
                setIsLoading(false)
            } catch (error) {
                console.error('Error fetching data:', error)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        // Apply filters and sorting
        let result = products.filter(product => {
            // Check if any of the product's categories match any of the selected category IDs
            const categoryMatch = filters.category.length === 0 ||
                product.category.some(productCategory =>
                    // Find if the category name from the database matches any selected category
                    filters.category.some(selectedCategoryId => {
                        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                        return selectedCategory && productCategory.toLowerCase() === selectedCategory.name.toLowerCase();
                    })
                );

            return (
                categoryMatch &&
                (filters.brand.length === 0 || filters.brand.includes(product.brandName)) &&
                (product.price >= filters.price.min && product.price <= filters.price.max) &&
                (filters.rating === 0 || product.rating >= filters.rating) &&
                (!filters.availability || product.isNew)
            );
        });

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

        // Save filters and sortBy to localStorage
        localStorage.setItem('storeFilters', JSON.stringify(filters))
        localStorage.setItem('storeSortBy', sortBy)
    }, [filters, sortBy, products, categories]);

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
                <h3 className="text-start font-semibold mb-4">Categories</h3>
                <div className="space-y-3">
                    {categories.map((category) => (
                        <CustomCheckbox
                            key={category.id}
                            checked={filters.category.includes(category.id.toString())}
                            onChange={() => {
                                setFilters(prev => ({
                                    ...prev,
                                    category: prev.category.includes(category.id.toString())
                                        ? prev.category.filter(id => id !== category.id.toString())
                                        : [...prev.category, category.id.toString()]
                                }))
                            }}
                            label={`${category.name} (${category.count})`}
                        />
                    ))}
                </div>
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
                            label={`${brand.name} (${brand.sales})`}
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
            {/*
            <div className="flex flex-col w-full sm:flex-row gap-4 mb-6">
                <CustomDropdown
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        {value: 'featured', label: 'Featured'},
                        {value: 'newest', label: 'Newest'},
                        {value: 'price-asc', label: 'Price: Low to High'},
                        {value: 'price-desc', label: 'Price: High to Low'},
                        {value: 'rating', label: 'Highest Rated'},
                    ]}
                />
            </div>
            */}

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




    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 pt-8">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-20">
                            <div className="hidden md:block">
                                <FilterSidebar/>
                            </div>
                            <CustomButton
                                className="w-full md:hidden"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4 mr-2 inline-block"/>
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </CustomButton>
                        </div>
                    </div>

                    <div className="flex-1 ">
                        {/* Active Filters */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.category.map((categoryId) => (
                                <CustomButton
                                    key={categoryId}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters(prev => ({
                                        ...prev,
                                        category: prev.category.filter(id => id !== categoryId)
                                    }))}
                                    className="px-3 py-1 text-sm"
                                >
                                    {categories.find(c => c.id === categoryId)?.name}
                                    <X className="ml-2 h-3 w-3 inline-block"/>
                                </CustomButton>
                            ))}
                            {filters.brand.map((brandName) => (
                                <CustomButton
                                    key={brandName}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters(prev => ({
                                        ...prev,
                                        brand: prev.brand.filter(name => name !== brandName)
                                    }))}
                                    className="px-3 py-1 text-sm"
                                >
                                    {brandName}
                                    <X className="ml-2 h-3 w-3 inline-block"/>
                                </CustomButton>
                            ))}
                            {filters.rating > 0 && (
                                <CustomButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters(prev => ({...prev, rating: 0}))}
                                    className="px-3 py-1 text-sm"
                                >
                                    {filters.rating}+ Stars
                                    <X className="ml-2 h-3 w-3 inline-block"/>
                                </CustomButton>
                            )}
                            {filters.availability && (
                                <CustomButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters(prev => ({...prev, availability: false}))}
                                    className="px-3 py-1 text-sm"
                                >
                                    In Stock Only
                                    <X className="ml-2 h-3 w-3 inline-block"/>
                                </CustomButton>
                            )}
                            {(filters.category.length > 0 || filters.brand.length > 0 || filters.rating > 0 || filters.availability) && (
                                <CustomButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFilters({
                                            category: [],
                                            brand: [],
                                            price: {min: 0, max: 1000},
                                            rating: 0,
                                            availability: false,
                                        })
                                        localStorage.removeItem('storeFilters')
                                    }}
                                    className="px-3 py-1 text-sm"
                                >
                                    Clear All
                                </CustomButton>
                            )}
                        </div>

                        {/* Mobile Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{opacity: 0, height: 0}}
                                    animate={{opacity: 1, height: 'auto'}}
                                    exit={{opacity: 0, height: 0}}
                                    transition={{duration: 0.3}}
                                    className="md:hidden mb-6 overflow-hidden"
                                >
                                    <FilterSidebar/>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    // Show skeleton loading UI
                                    Array.from({length: 6}).map((_, index) => (
                                        <ProductCardSkeleton key={`skeleton-${index}`}/>
                                    ))
                                ) : (
                                    // Show actual products
                                    filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product}/>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
            <Chatbot apiToken={'3VLpaNJtAR3eHX2GOiwKyO7omt2r3lx4'}/>
        </div>
    )
}