// Products.tsx

import React from 'react';

const Products: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100">
            <h1 className="text-3xl font-bold text-neutral-800">Our Products</h1>
            <p className="mt-4 text-lg text-neutral-600">Browse our selection of products.</p>
        </div>
    );
};

export default Products;
