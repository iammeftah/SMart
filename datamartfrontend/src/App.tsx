import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layout Components
import Header from "./components/layout/Header";

// Page Components
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Store from "./pages/Store";
import ClearancePage from "./pages/app/Clearance";
import FeaturedPage from "./pages/app/Featured";
import NewArrivalsPage from "./pages/app/NewArrival";
import TopBrandsPage from "./pages/app/TopBrands";
import TrendingPage from "./pages/app/Trending";
import TodaysDealsPage from "./pages/app/todays-deal";
import CategoryPage from "./pages/CategoryPage";
import ProductCRUD from "./pages/ProductCRUD";
import ProductPage from "./pages/ProductPage";
import Success from "./pages/Success"; // Import Success Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartProvider } from "./contexts/CartContext";

// Protected Route Component
interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/account" />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

// App Routes Component
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store/clearance" element={<ClearancePage />} />
            <Route path="/store/featured" element={<FeaturedPage />} />
            <Route path="/store/new-arrival" element={<NewArrivalsPage />} />
            <Route path="/store/top-brands" element={<TopBrandsPage />} />
            <Route path="/store/trending" element={<TrendingPage />} />
            <Route path="/store/todays-deals" element={<TodaysDealsPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />

            <Route
                path="/product-manage"
                element={
                    <ProtectedRoute adminOnly>
                        <ProductCRUD />
                    </ProtectedRoute>
                }
            />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/success" element={<Success />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const queryClient = new QueryClient();
const stripePromise = loadStripe("pk_test_51PeM4VE38gz1e3HyUYQ85O3HMzbb8Om6jmsatVwPXPPwIITuzGx8Hy6WuSniTGM3RXT6PikF1g5Q0l29HEt7BNdc00zmZoc0IF");

function App() {
    return (
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <CartProvider>
                        <Elements stripe={stripePromise}>
                            <div className="App flex flex-col min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
                                <Header />
                                <main className="flex-grow md:pt-[168px] pb-16 md:pb-0">
                                    <AppRoutes />
                                </main>
                            </div>
                        </Elements>
                    </CartProvider>
                </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    );
}

export default App;
