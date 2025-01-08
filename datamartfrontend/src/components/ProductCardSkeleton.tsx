import { motion } from 'framer-motion'

export function ProductCardSkeleton() {
    return (
        <motion.div
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative">
                <div className="w-full h-48 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                <div className="absolute top-2 right-2 flex flex-row gap-2">
                    <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-lg animate-pulse" />
                    <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-lg animate-pulse" />
                </div>
                <div className="absolute bottom-2 left-2 w-24 h-6 bg-neutral-300 dark:bg-neutral-600 rounded-md animate-pulse" />
            </div>
            <div className="p-4">
                <div className="w-3/4 h-6 bg-neutral-300 dark:bg-neutral-600 rounded mb-2 animate-pulse" />
                <div className="flex items-center mb-2">
                    <div className="w-4 h-4 bg-neutral-300 dark:bg-neutral-600 rounded-full animate-pulse" />
                    <div className="w-24 h-4 bg-neutral-300 dark:bg-neutral-600 rounded ml-1 animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="w-16 h-6 bg-neutral-300 dark:bg-neutral-600 rounded animate-pulse" />
                    <div className="w-12 h-4 bg-neutral-300 dark:bg-neutral-600 rounded animate-pulse" />
                </div>
            </div>
        </motion.div>
    )
}