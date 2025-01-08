import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
    message: string
    show: boolean
    type: 'success' | 'error' | 'info'
}

export default function Toast({ message, show, type }: ToastProps) {
    const bgColor =
        type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-rose-500' :
                'bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600'  // neutral color for 'info'

    const textColor =
        type === 'success' ? 'text-white' :
            type === 'error' ? 'text-white' :
                'text-black dark:text-white'  // text color for 'info'

    const iconColor =
        type === 'success' ? 'text-white' :
            type === 'error' ? 'text-white' :
                'text-neutral-700 dark:text-neutral-200'  // icon color for 'info'

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`fixed top-4 right-4 text-start ${bgColor} ${textColor} px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2 max-w-xs sm:max-w-sm`}
                >
                    {type === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : type === 'error' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    )}
                    <span className="text-sm">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}