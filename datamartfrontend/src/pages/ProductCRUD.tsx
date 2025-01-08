'use client'

import React, {useState, useEffect, useMemo, useRef} from 'react'
import { motion } from 'framer-motion'
import {Plus, Edit, Trash2, Search, Star, AlertTriangle} from 'lucide-react'
import { Product } from '../Interfaces/Product'

import Paginator from '../components/Paginator'
import {ProductService} from "../services/productsService"
import {Brand} from "../Interfaces/Brand"
import {Category} from "../Interfaces/Category"
import {CategoryService} from "../services/categoryService"
import {BrandService} from "../services/brandService"
import Toast from '../components/Toast'
import { Modal } from '../components/Modal'
import debounce from 'lodash/debounce'




export default function ProductCRUD() {
    // State declarations
    const [activeTab, setActiveTab] = useState('display')
    const [products, setProducts] = useState<Product[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [toastMessage, setToastMessage] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [toastType, setToastType] = useState<'success' | 'error'>('success')

    const [modalOpen, setModalOpen] = useState(false)
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: () => {} })

    const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
        name: '',
        description: '',
        price: 0,
        rating: 2.5,
        reviews: 0,
        image: '',
        category: [],
        brandId: 0,
        brandName: '',
        isNew: false,
        isFeatured: false,
        postedDate: new Date(),
        purchaseCount: 0,
        clearance: false,
        discount: 0,
        stock: 0,
    })
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const productsPerPage = 20

    // Toast handler
    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message)
        setToastType(type)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    // Modal handler
    const showModal = (title: string, message: string, onConfirm: () => void) => {
        setModalConfig({ title, message, onConfirm })
        setModalOpen(true)
    }

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true)
                const [brandsData, categoriesData] = await Promise.all([
                    BrandService.getAllBrands(),
                    CategoryService.getAllCategories()
                ]);
                setBrands(brandsData)
                setCategories(categoriesData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching initial data')
                showToastMessage('Failed to fetch initial data', 'error')
            }
        }

        fetchInitialData()
    }, [])

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Use useMemo to memoize the debounce function
    const debouncedSearch = useMemo(
        () => debounce((term: string) => {
            setDebouncedSearchTerm(term)
        }, 300),
        []
    )

    // Update searchTerm and trigger debounced search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        debouncedSearch(value)
    }

    // Fetch products when debouncedSearchTerm changes
    useEffect(() => {
        const fetchProducts = async () => {
            if (debouncedSearchTerm === '') return // Don't fetch if search term is empty

            try {
                setLoading(true)
                const fetchedProducts = await ProductService.searchProducts(debouncedSearchTerm)
                setProducts(fetchedProducts)
                setCurrentPage(1) // Reset to first page when search results change
            } catch (err) {
                console.error('Error fetching products:', err)
                showToastMessage('Failed to fetch products', 'error')
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [debouncedSearchTerm])

    // Fetch all products on initial load
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true)
                const fetchedProducts = await ProductService.getAllProducts()
                setProducts(fetchedProducts)
            } catch (err) {
                console.error('Error fetching all products:', err)
                showToastMessage('Failed to fetch products', 'error')
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchAllProducts()
    }, [])

    // Function to handle input focus
    const handleInputFocus = () => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }

    // Handler functions
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation check for empty fields, excluding rating, reviews, and purchaseCount
        const requiredFields = ['name', 'description', 'price', 'image', 'category', 'brandName']
        const emptyFields = requiredFields.filter(field => {
            if (field === 'category') return (newProduct.category as string[]).length === 0
            if (field === 'price') return newProduct.price <= 0
            return !newProduct[field as keyof typeof newProduct]
        })

        if (emptyFields.length > 0) {
            showToastMessage(`Please fill in all required fields. Empty fields: ${emptyFields.join(', ')}`, 'error')
            return
        }

        try {
            const selectedBrand = brands.find(b => b.name === newProduct.brandName)
            if (!selectedBrand) {
                showToastMessage('Please select a valid brand', 'error')
                return
            }

            const productWithBrandId = {
                ...newProduct,
                brandId: selectedBrand.id,
                rating: 2.5,  // Set default value
                reviews: 0,  // Set default value
                purchaseCount: 0  // Set default value
            }
            const createdProduct = await ProductService.createProduct(productWithBrandId)
            setProducts([...products, createdProduct])
            setNewProduct({
                name: '',
                description: '',
                price: 0,
                rating: 2.5,
                reviews: 0,
                image: '',
                category: [],
                brandId: 0,
                brandName: '',
                isNew: false,
                isFeatured: false,
                postedDate: new Date(),
                purchaseCount: 0,
                clearance: false,
                discount: 0,
                stock:0,
            })
            setActiveTab('display')
            showToastMessage('Product added successfully', 'success')
        } catch (err) {
            showToastMessage('Failed to add product', 'error')
        }
    }



    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingProduct) {
            try {
                const updatedProduct = await ProductService.updateProduct(editingProduct.id, editingProduct)
                setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
                setEditingProduct(null)
                setActiveTab('display')
                showToastMessage('Product updated successfully', 'success')
            } catch (err) {
                showToastMessage('Failed to update product', 'error')
            }
        }
    }

    const handleDeleteProduct = (id: string) => {
        showModal(
            'Confirm Deletion',
            'Are you sure you want to delete this product?',
            async () => {
                try {
                    await ProductService.deleteProduct(id)
                    setProducts(products.filter(p => p.id !== id))
                    showToastMessage('Product deleted successfully', 'success')
                } catch (err) {
                    showToastMessage('Failed to delete product', 'error')
                }
                setModalOpen(false)
            }
        )
    }


    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)

    const totalPages = Math.ceil(products.length / productsPerPage)
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="text-rose-600 text-xl">{error}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 md:p-8">
            <Toast
                message={toastMessage}
                show={showToast}
                type={toastType}
            />


            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                icon={<AlertTriangle className="size-6 text-rose-600" />}
                primaryButton={{
                    label: "Confirm",
                    onClick: () => {modalConfig.onConfirm()},
                    variant: "primary" // or "danger" or "secondary"
                }}
                secondaryButton={{
                    label: "Cancel",
                    onClick: () => setModalOpen(false),
                    variant: "secondary"
                }}
            />

            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Product Management</h1>

                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div className="flex flex-wrap gap-2">
                            {['display', 'add', 'edit'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`outline-none px-4 py-2 rounded-full transition-colors ${
                                        activeTab === tab
                                            ? 'font-bold bg-rose-600 text-white'
                                            : 'bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'display' && (
                            <div className="relative w-full sm:w-64">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onBlur={() => setTimeout(handleInputFocus, 0)}
                                    className="w-full h-10 px-3 rounded-full bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                                />
                                <Search className="absolute right-3 top-2.5 text-neutral-400"/>
                            </div>
                        )}
                    </div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                    >
                        {activeTab === 'display' && (
                            <div>
                                <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                                        <thead className="bg-neutral-50 dark:bg-neutral-700">
                                        <tr>
                                            <th className="text-start px-6 py-2 md:py-3  text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name</th>
                                            <th className="text-start px-6 py-2 md:py-3  text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Price</th>
                                            <th className="text-start px-6 py-2 md:py-3  text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Rating</th>
                                            <th className="px-6 py-2 md:py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Category</th>
                                            <th className="text-start px-6 py-2 md:py-3  text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Brand</th>
                                            <th className="text-start px-6 py-2 md:py-3  text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                        {currentProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td className="text-start px-6 py-2 md:py-3 whitespace-nowrap">{product.name}</td>
                                                <td className="text-start font-bold px-6 py-2 md:py-3 whitespace-nowrap">${product.price.toFixed(2)}</td>
                                                <td className="text-start px-6 py-2 md:py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 text-yellow-400 mr-1"/>
                                                        {product.rating.toFixed(1)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 md:py-3 whitespace-nowrap">
                                                    <div className="flex flex-wrap justify-center gap-2">
                                                        {product.category.map((category, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200"
                                                            >
                                                            {category}
                                                          </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="text-start px-6 py-2 md:py-3 whitespace-nowrap">{product.brandName}</td>
                                                <td className="text-start px-6 py-2 md:py-3 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingProduct(product)
                                                                setActiveTab('edit')
                                                            }}
                                                            className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300"
                                                        >
                                                            <Edit className="w-5 h-5"/>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300"
                                                        >
                                                            <Trash2 className="w-5 h-5"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Paginator
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}

                        {(activeTab === 'add' || (activeTab === 'edit' && editingProduct)) && (
                            <form onSubmit={activeTab === 'add' ? handleAddProduct : handleUpdateProduct} className="space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={activeTab === 'add' ? newProduct.name : editingProduct?.name}
                                            onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, name: e.target.value }) : setEditingProduct({ ...editingProduct!, name: e.target.value })}
                                            className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"

                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                                        <textarea
                                            id="description"
                                            value={activeTab === 'add' ? newProduct.description : editingProduct?.description}
                                            onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, description: e.target.value }) : setEditingProduct({ ...editingProduct!, description: e.target.value })}
                                            className="w-full h-20 px-3 py-2 rounded-3xl bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"

                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="price" className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Price</label>
                                            <input
                                                type="number"
                                                id="price"
                                                value={activeTab === 'add' ? newProduct.price : editingProduct?.price}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, price: parseFloat(e.target.value) }) : setEditingProduct({ ...editingProduct!, price: parseFloat(e.target.value) })}
                                                className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"

                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="rating" className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Rating</label>
                                            <input
                                                type="number"
                                                id="rating"
                                                value={activeTab === 'add' ? newProduct.rating : editingProduct?.rating}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, rating: parseFloat(e.target.value) }) : setEditingProduct({ ...editingProduct!, rating: parseFloat(e.target.value) })}
                                                className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="reviews" className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Reviews</label>
                                            <input
                                                type="number"
                                                id="reviews"
                                                value={activeTab === 'add' ? newProduct.reviews : editingProduct?.reviews}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, reviews: parseInt(e.target.value) }) : setEditingProduct({ ...editingProduct!, reviews: parseInt(e.target.value) })}
                                                className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="image" className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Image URL</label>
                                            <input
                                                type="url"
                                                id="image"
                                                value={activeTab === 'add' ? newProduct.image : editingProduct?.image}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, image: e.target.value }) : setEditingProduct({ ...editingProduct!, image: e.target.value })}
                                                className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"

                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="brandName"
                                                   className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Brand</label>
                                            <select
                                                id="brandName"
                                                value={activeTab === 'add' ? newProduct.brandName : editingProduct?.brandName}
                                                onChange={(e) => {
                                                    const selectedBrand = brands.find(b => b.name === e.target.value)
                                                    if (selectedBrand) {
                                                        if (activeTab === 'add') {
                                                            setNewProduct({
                                                                ...newProduct,
                                                                brandName: selectedBrand.name,
                                                                brandId: selectedBrand.id
                                                            })
                                                        } else {
                                                            setEditingProduct({
                                                                ...editingProduct!,
                                                                brandName: selectedBrand.name,
                                                                brandId: selectedBrand.id
                                                            })
                                                        }
                                                    }
                                                }}
                                                className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"

                                            >
                                                <option value="">Select a brand</option>
                                                {brands.map((brand) => (
                                                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="purchaseCount"
                                                   className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Purchase
                                                Count</label>
                                            <input
                                                type="number"
                                                id="purchaseCount"
                                                value={activeTab === 'add' ? newProduct.purchaseCount : editingProduct?.purchaseCount}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({
                                                    ...newProduct,
                                                    purchaseCount: parseInt(e.target.value)
                                                }) : setEditingProduct({
                                                    ...editingProduct!,
                                                    purchaseCount: parseInt(e.target.value)
                                                })}
                                                className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="discount"
                                                   className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Discount
                                                (%)</label>
                                            <input
                                                type="number"
                                                id="discount"
                                                value={activeTab === 'add' ? newProduct.discount : editingProduct?.discount}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, discount: parseInt(e.target.value) }) : setEditingProduct({ ...editingProduct!, discount: parseInt(e.target.value) })}
                                                className="w-full h-10 px-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus:border-rose-500 hover:border-rose-300 dark:hover:border-rose-700 focus:outline-none transition-colors text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="text-start block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => {
                                                    const categoryName = category.name
                                                    const updatedCategories = activeTab === 'add'
                                                        ? newProduct.category.includes(categoryName)
                                                            ? newProduct.category.filter(c => c !== categoryName)
                                                            : [...newProduct.category, categoryName]
                                                        : editingProduct!.category.includes(categoryName)
                                                            ? editingProduct!.category.filter(c => c !== categoryName)
                                                            : [...editingProduct!.category, categoryName]
                                                    activeTab === 'add'
                                                        ? setNewProduct({
                                                            ...newProduct,
                                                            category: updatedCategories
                                                        })
                                                        : setEditingProduct({
                                                            ...editingProduct!,
                                                            category: updatedCategories
                                                        })
                                                }}
                                                className={`outline-none px-3 py-1 rounded-full text-sm ${
                                                    (activeTab === 'add' ? newProduct.category : editingProduct?.category)?.includes(category.name)
                                                        ? 'bg-rose-600 text-white'
                                                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                                                } transition-colors`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <span
                                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Is New</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={activeTab === 'add' ? newProduct.isNew : editingProduct?.isNew}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({
                                                    ...newProduct,
                                                    isNew: e.target.checked
                                                }) : setEditingProduct({...editingProduct!, isNew: e.target.checked})}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`block w-14 h-8 rounded-full ${(activeTab === 'add' ? newProduct.isNew : editingProduct?.isNew) ? 'bg-rose-600' : 'bg-neutral-400 dark:bg-neutral-600'}`}></div>
                                            <div
                                                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${(activeTab === 'add' ? newProduct.isNew : editingProduct?.isNew) ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Is Featured</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={activeTab === 'add' ? newProduct.isFeatured : editingProduct?.isFeatured}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({
                                                    ...newProduct,
                                                    isFeatured: e.target.checked
                                                }) : setEditingProduct({
                                                    ...editingProduct!,
                                                    isFeatured: e.target.checked
                                                })}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`block w-14 h-8 rounded-full ${(activeTab === 'add' ? newProduct.isFeatured : editingProduct?.isFeatured) ? 'bg-rose-600' : 'bg-neutral-400 dark:bg-neutral-600'}`}></div>
                                            <div
                                                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${(activeTab === 'add' ? newProduct.isFeatured : editingProduct?.isFeatured) ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Clearance</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={activeTab === 'add' ? newProduct.clearance : editingProduct?.clearance}
                                                onChange={(e) => activeTab === 'add' ? setNewProduct({ ...newProduct, clearance: e.target.checked }) : setEditingProduct({ ...editingProduct!, clearance: e.target.checked })}
                                                className="sr-only"
                                            />
                                            <div className={`block w-14 h-8 rounded-full ${(activeTab === 'add' ? newProduct.clearance : editingProduct?.clearance) ? 'bg-rose-600' : 'bg-neutral-400 dark:bg-neutral-600'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${(activeTab === 'add' ? newProduct.clearance : editingProduct?.clearance) ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                                <button type="submit" className="outline-none w-full h-10 px-4 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors">
                                    {activeTab === 'add' ? (
                                        <div className="flex items-center justify-center ">
                                            <Plus className="w-5 h-5 inline-block mr-2" />
                                            Add Product
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center ">
                                            <Edit className="w-5 h-5 inline-block mr-2" />
                                            Update Product
                                        </div>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}