import React from 'react'

interface CustomButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
                                                              onClick,
                                                              children,
                                                              variant = 'default',
                                                              size = 'default',
                                                              className = ''
                                                          }) => {
    const baseStyle = "outline-none font-medium rounded-lg focus:outline-none transition-all duration-200"
    const variantStyles = {
        default: "outline-none bg-primary hover:bg-primary/90 text-primary-foreground",
        outline: "outline-none border border-neutral-300 dark:border-neutral-600 hover:border-primary dark:hover:border-primary text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary",
        ghost: "outline-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    }
    const sizeStyles = {
        default: "px-4 py-2 text-sm",
        sm: "px-2 py-1 text-xs",
        lg: "px-6 py-3 text-base"
    }

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variantStyles[variant]} ${className}`}
        >
            {children}
        </button>
    )
}