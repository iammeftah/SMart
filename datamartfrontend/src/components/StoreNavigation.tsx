import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, MotionValue } from 'framer-motion'
import { Store, Tag, Star, Sparkles, TrendingUp, Award, Percent } from 'lucide-react'

const navItems = [
    { path: '/store', label: 'Store', icon: Store },
    { path: '/store/todays-deals', label: "Today's Deals", icon: Tag },
    { path: '/store/featured', label: 'Featured', icon: Star },
    { path: '/store/new-arrival', label: 'New Arrivals', icon: Sparkles },
    { path: '/store/trending', label: 'Trending Now', icon: TrendingUp },
    { path: '/store/top-brands', label: 'Top Brands', icon: Award },
    { path: '/store/clearance', label: 'Clearance', icon: Percent },
]

interface StoreNavigationProps {
    navBarOpacity: MotionValue<number>
}

const StoreNavigation: React.FC<StoreNavigationProps> = ({ navBarOpacity }) => {
    const location = useLocation()

    return (
        <motion.nav
            className="border-t border-neutral-200 dark:border-neutral-700 overflow-hidden"
            style={{ opacity: navBarOpacity, height: 48 }}
        >
            <div className="container mx-auto px-4 h-12">
                <div className="flex items-center space-x-8 h-full">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `whitespace-nowrap transition-colors flex items-center ${
                                    isActive
                                        ? 'text-rose-600 dark:text-rose-400 font-medium'
                                        : 'text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400'
                                }`
                            }
                            end={item.path === '/store'}
                        >
                            {item.path === '/store' ? (
                                <item.icon className="w-5 h-5" />
                            ) : (
                                <>
                                    <item.icon className="w-5 h-5 mr-2" />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </motion.nav>
    )
}

export default StoreNavigation