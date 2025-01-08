'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Bell, Gift, CreditCard } from 'lucide-react'
import Toast from '../components/Toast'
import {useAuth} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
import {authService} from "../services/authService";

export default function Account() {
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [showCreateAccount, setShowCreateAccount] = useState(false)
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { login, register } = useAuth()
    const navigate = useNavigate()



    const [toastMessage, setToastMessage] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [toastType, setToastType] = useState<'success' | 'error'>('success')



    const showToastMessage = (message: string, type: 'success' | 'error' = 'error') => {
        setToastMessage(message)
        setToastType(type)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    const validateForm = () => {
        if (isSubmitted) {
            if (!email || !password) {
                showToastMessage("Email and password are required", "error");
                return false;
            }

            if (!isLogin && !fullName) {
                showToastMessage("Full name is required for registration", "error");
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToastMessage("Please enter a valid email address", "error");
                return false;
            }

            if (!isLogin && password !== confirmPassword) {
                showToastMessage("Passwords don't match", "error");
                return false;
            }

            if (password.length < 6) {
                showToastMessage("Password must be at least 6 characters long", "error");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            if (!isLogin) {
                // First, check if email already exists
                const emailExists = await authService.checkEmailExists(email);
                if (emailExists) {
                    showToastMessage("An account with this email already exists", "error");
                    setIsLoading(false);
                    return;
                }

                await register(fullName, email, password);
                showToastMessage("Registration successful!", "success");
                setShowCreateAccount(true);
            } else {
                await login(email, password);
                showToastMessage("Login successful!", "success");
                navigate('/store');
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            let errorMessage = 'An error occurred';

            if (error.response) {
                errorMessage = error.response.data?.message || 'Server error occurred';
            } else if (error.request) {
                errorMessage = 'Unable to reach the server. Please check your connection.';
            } else {
                errorMessage = error.message || 'An unexpected error occurred';
            }

            showToastMessage(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };




    const handleToggleMode = () => {
        setIsLogin(!isLogin)
        setIsSubmitted(false)
        setShowToast(false)
        setShowCreateAccount(false)
        setPassword('')
        setConfirmPassword('')
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.4, ease: "easeInOut", when: "beforeChildren", staggerChildren: 0.1 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.4, ease: "easeInOut", when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
        },
        exit: {
            y: -20,
            opacity: 0,
            transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-168px)] flex items-center justify-center p-4 md:p-8">
            <Toast message={toastMessage} show={showToast} type={toastType}/>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{
                    duration: 1,
                    ease: [0.6, -0.05, 0.01, 0.99],
                }}
                className="flex items-center bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl"
                layout
            >
                <div className="flex flex-col md:flex-row w-full">
                    <motion.div
                        className={`md:w-1/2 p-8 md:p-12 ${
                            isLogin
                                ? 'order-2 md:order-2'
                                : 'order-1 md:order-1'
                        } bg-white dark:bg-neutral-800 md:bg-gradient-to-r md:from-rose-600 md:to-fuchsia-700 md:dark:from-rose-800 md:dark:to-fuchsia-900 text-neutral-900 dark:text-white md:text-white`}
                        layout
                        transition={{duration: 0.8, type: "spring", stiffness: 100, damping: 30}}
                    >
                        <h3 className="text-2xl font-bold mb-8 hidden md:block">Account Benefits</h3>
                        <ul className="space-y-4 hidden md:block">
                            <li className="flex items-center">
                                <Bell className="mr-4 flex-shrink-0" size={24}/>
                                <span>Get notified about exclusive offers</span>
                            </li>
                            <li className="flex items-center">
                                <Gift className="mr-4 flex-shrink-0" size={24}/>
                                <span>Earn rewards on every purchase</span>
                            </li>
                            <li className="flex items-center">
                                <CreditCard className="mr-4 flex-shrink-0" size={24}/>
                                <span>Secure and easy payments</span>
                            </li>
                        </ul>
                    </motion.div>
                    <motion.div
                        className={`md:w-1/2 p-8 md:p-12 ${
                            isLogin
                                ? 'order-1 md:order-1'
                                : 'order-2 md:order-2'
                        } bg-white dark:bg-neutral-800`}
                        layout
                        transition={{duration: 0.6, type: "spring", stiffness: 100, damping: 30}}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="text-neutral-900 dark:text-white"
                                layout
                            >
                                <motion.h2
                                    className="text-3xl font-bold mb-8 text-center"
                                    variants={itemVariants}
                                >
                                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                                </motion.h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <AnimatePresence mode="wait">
                                        {!isLogin && (
                                            <motion.div
                                                key="fullname"
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <div className="space-y-2">
                                                    <label htmlFor="name"
                                                           className="text-start block text-sm font-medium">Full Name</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 outline-none transition-all duration-200 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                                            placeholder="John Doe"
                                                        />
                                                        <User
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                                                            size={18}/>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label htmlFor="email"
                                               className="text-start block text-sm font-medium">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 outline-none transition-all duration-200 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                                placeholder="you@example.com"
                                            />
                                            <Mail
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                                                size={18}/>
                                        </div>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label htmlFor="password"
                                               className="text-start block text-sm font-medium">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 outline-none transition-all duration-200 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="outline-none absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                                            >
                                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                            </button>
                                        </div>
                                    </motion.div>
                                    {!isLogin && (
                                        <motion.div variants={itemVariants} className="space-y-2">
                                            <label htmlFor="confirmPassword"
                                                   className="text-start block text-sm font-medium">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="confirmPassword"
                                                    className="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 outline-none transition-all duration-200 ease-in-out hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                    <motion.button
                                        variants={itemVariants}
                                        whileHover={{scale: 1.03}}
                                        className="outline-none w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ease-in-out bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg"
                                        type="submit"
                                    >
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </motion.button>
                                    {isLogin && (
                                        <motion.div
                                            className="mt-6 space-y-4"
                                        >
                                            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">Or continue with</p>
                                            <div className="flex flex-col gap-4 justify-center items-center">
                                                <motion.button
                                                    whileHover={{scale: 1.03}}
                                                    className="outline-none w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ease-in-out bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center justify-center shadow-sm hover:shadow-md"
                                                >
                                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                                    </svg>
                                                    Sign in with Google
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{scale: 1.03}}
                                                    className="outline-none w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ease-in-out bg-black hover:bg-neutral-900 text-white flex items-center justify-center shadow-sm hover:shadow-md"
                                                >
                                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                                        <path fill="currentColor"
                                                              d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                                    </svg>
                                                    Sign in with Apple
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                    <motion.p
                                        variants={itemVariants}
                                        className="mt-6 text-center text-sm"
                                    >
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                                        <button
                                            onClick={handleToggleMode}
                                            className="outline-none ml-1 font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 relative group"
                                        >
                                            <span>{isLogin ? 'Sign up' : 'Sign in'}</span>
                                            <span
                                                className="absolute bottom-0 left-1/2 w-0 h-px bg-current opacity-0 group-hover:w-full group-hover:left-0 group-hover:opacity-100 transition-all duration-500 ease-out -translate-x-1/2 group-hover:translate-x-0">
                                                <span
                                                    className="absolute inset-0 w-full h-full bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-center"/>
                                            </span>
                                        </button>
                                    </motion.p>
                                </form>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}