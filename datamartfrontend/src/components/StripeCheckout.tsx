"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { CreditCard } from 'lucide-react';
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const stripePromise = loadStripe(
    "pk_test_51PeM4VE38gz1e3HyUYQ85O3HMzbb8Om6jmsatVwPXPPwIITuzGx8Hy6WuSniTGM3RXT6PikF1g5Q0l29HEt7BNdc00zmZoc0IF" || ""
);

interface StripeCheckoutProps {
    cartTotal: number;
    isDisabled: boolean;
}

function StripeCheckoutComponent({ cartTotal, isDisabled }: StripeCheckoutProps) {
    const stripe = useStripe();
    const [isLoading, setIsLoading] = useState(false);
    const { initiateCheckout } = useCart();
    const { user } = useAuth();

    const handleCheckout = async () => {
        if (!stripe) {
            console.error("Stripe is not initialized");
            return;
        }

        setIsLoading(true);

        try {
            console.log("Initializing checkout process...");

            await initiateCheckout();
            console.log("Checkout initiated");

            const token = user?.token;
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }

            const response = await axios.post(
                `http://localhost:8083/api/checkout/create-session`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Checkout Response:", response.data);

            if (!response.data.stripeSessionId) {
                throw new Error("No session ID received from server");
            }

            const { error } = await stripe.redirectToCheckout({
                sessionId: response.data.stripeSessionId,
            });

            if (error) {
                console.error("Stripe Checkout Error:", error.message);
                throw new Error(error.message || "Checkout failed");
            }

            console.log("Redirecting to Stripe Checkout...");
        } catch (error) {
            console.error("Checkout error:", error);
            alert(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={isLoading || cartTotal === 0 || isDisabled}
            className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <CreditCard className="mr-2" />
            {isLoading ? "Processing..." : "Proceed to Checkout"}
        </button>
    );
}

export function StripeCheckout(props: StripeCheckoutProps) {
    return (
        <Elements stripe={stripePromise}>
            <StripeCheckoutComponent {...props} />
        </Elements>
    );
}

