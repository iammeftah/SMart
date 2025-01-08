// components/layout/Navigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/products', label: 'Products' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <nav>
            <ul className="flex gap-6">
                {navItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            to={item.path}
                            className="text-white hover:text-neutral-300"
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navigation;