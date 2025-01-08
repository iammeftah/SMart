import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '../services/authService'

export const AccountDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const isAuthenticated = authService.isAuthenticated()

    const navigate = useNavigate();


    const toggleDropdown = () => setIsOpen(!isOpen)

    const handleLogout = async () => {
        await authService.logout(navigate)
        setIsOpen(false)
        // You might want to add a state update or redirect here
    }

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="p-2 outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400"
                aria-label="Account"
            >
                <User className="w-6 h-6" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-md shadow-lg py-1 z-50"
                    >
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/account"
                                    className="text-start block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    onClick={() => setIsOpen(false)}
                                >
                                    My Account
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <LogOut className="w-4 h-4 inline-block mr-2" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/account"
                                className="text-start block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                onClick={() => setIsOpen(false)}
                            >
                                <LogIn className="w-4 h-4 inline-block mr-2" />
                                Login
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
