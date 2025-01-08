import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { CheckCircle } from 'lucide-react';
import {Modal} from "../components/Modal";

export default function Success() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [message, setMessage] = useState("Processing payment...");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        const token = user?.token;

        if (!token) {
            console.error("No authentication token found. Cannot confirm payment.");
            setMessage("You are not logged in. Please log in to confirm the payment.");
            setIsProcessing(false);
            setIsModalOpen(true);
            return;
        }

        if (sessionId) {
            console.log("Session ID found in URL:", sessionId);
            confirmPayment(sessionId, token);
        } else {
            console.error("No session_id found in URL");
            setMessage("Failed to process the payment. No session ID provided.");
            setIsProcessing(false);
            setIsModalOpen(true);
        }
    }, [searchParams, user, navigate]);

    const confirmPayment = async (sessionId: string, token: string) => {
        try {
            console.log("Sending confirmation with:", { sessionId, token });

            const response = await axios.post(
                `http://localhost:8083/api/checkout/confirm/${sessionId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.status === "success") {
                console.log("Payment confirmed successfully!");
                setMessage("Payment confirmed successfully!");
                setIsModalOpen(true);
            } else {
                console.error("Payment confirmation failed:", response.data.message);
                setMessage(`Payment confirmation failed: ${response.data.message}`);
                setIsModalOpen(true);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred";
            console.error("Payment confirmation error:", errorMessage);
            setMessage(errorMessage);
            setIsModalOpen(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGoBackToStore = () => {
        navigate("/store");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100">
            {isProcessing && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                >
                    <div className="w-16 h-16 border-t-4 border-rose-500 border-solid rounded-full animate-spin"></div>
                </motion.div>
            )}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Payment Status"
                message={
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-neutral-600 text-center"
                    >
                        {message}
                    </motion.p>
                }
                icon={
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </motion.div>
                }
                primaryButton={{
                    label: "Go Back to Store",
                    onClick: handleGoBackToStore,
                    variant: "primary"
                }}
                secondaryButton={{
                    label: "Close",
                    onClick: () => setIsModalOpen(false),
                    variant: "secondary"
                }}
            />
        </div>
    );
}

