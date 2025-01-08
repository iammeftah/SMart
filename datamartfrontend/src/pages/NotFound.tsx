import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-168px)] bg-neutral-50 dark:bg-neutral-900 px-4">
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="flex items-center justify-center mb-8"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                    <div className="relative">
                        <Bot className="w-24 h-24 text-rose-500 dark:text-rose-400" />
                        <AlertCircle className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                    </div>
                </motion.div>

                <motion.h1
                    className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    404 - Page Not Found
                </motion.h1>

                <motion.p
                    className="text-lg text-neutral-600 dark:text-neutral-400 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Oops! Looks like our AI couldn't find what you're looking for.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-medium transition-colors duration-200"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Back to Homepage
                    </a>
                </motion.div>
            </motion.div>

            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-rose-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-rose-500 rounded-full animate-ping opacity-20 animation-delay-200"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-rose-500 rounded-full animate-ping opacity-20 animation-delay-500"></div>
                <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-rose-500 rounded-full animate-ping opacity-20 animation-delay-700"></div>
            </div>
        </div>
    );
};

export default NotFound;

