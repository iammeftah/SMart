import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThreeDotsWave } from "./ThreedotsWave";
import { useQuery } from '@tanstack/react-query';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface DisplayMessage {
    sender: 'user' | 'bot';
    text: string;
    products?: Product[];
}

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
}

const SYSTEM_CONTEXT = `You are a helpful assistant for our e-commerce application called "SMart".
 
When users ask about specific products, you should:
1. Search our product database and provide specific recommendations
2. Format your responses with markdown to create clickable product links
3. Structure your responses like this: "Here's the [Product Name](product_id)" or "Check out our [Product Name](product_id)"
4. Always maintain a friendly and helpful tone

Example response format:
"I found these headphones for you:
• Check out our [Sony WH-1000XM4](67798da956c52a2b17c32391)
• Here's our [Bose QuietComfort](89798da956c52a2b17c32392)"

Remember to:
- Respond naturally about the products we have in stock
- Format product links consistently
- If we don't have what they're looking for, suggest alternatives
- Be helpful and conversational`;

const Chatbot = ({ apiToken }: { apiToken: string }) => {
    const navigate = useNavigate();
    const [showChatbot, setShowChatbot] = useState(false);
    const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([
        { sender: 'bot', text: "👋 Hello! How can I help you find products in our store today?" }
    ]);
    const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([
        { role: 'system', content: SYSTEM_CONTEXT },
        { role: 'assistant', content: "👋 Hello! How can I help you find products in our store today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);

    // Enhanced product search with error handling
    async function searchProducts(query: string): Promise<Product[]> {
        try {
            const response = await fetch(
                `http://localhost:8082/api/products/search?term=${encodeURIComponent(query)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Product search error:', error);
            return []; // Return empty array instead of throwing
        }
    }

    // Convert markdown-style links to clickable elements
    const formatMessageWithLinks = (text: string): JSX.Element => {
        const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

        return (
            <>
                {parts.map((part, index) => {
                    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                    if (linkMatch) {
                        const [_, text, productId] = linkMatch;
                        return (
                            <span
                                key={index}
                                className="text-primary hover:text-primary/80 cursor-pointer underline"
                                onClick={() => navigate(`/product/${productId}`)}
                            >
                                {text}
                            </span>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </>
        );
    };

    const formatProductResponse = (products: Product[]): string => {
        if (products.length === 0) {
            return "I couldn't find exactly what you're looking for right now. Would you like me to show you similar products or check our latest arrivals?";
        }

        let response = "I found these products that might interest you:\n\n";
        products.forEach(product => {
            response += `• Check out our [${product.name}](${product.id}) - $${product.price.toFixed(2)}\n`;
        });
        response += "\nWould you like more details about any of these products?";
        return response;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        setError(null);
        setIsLoading(true);

        const userMessage = userInput.trim();
        setDisplayMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setUserInput('');

        try {
            // Search for products
            const products = await searchProducts(userMessage);

            // Prepare messages
            const systemMessageWithProducts: ChatMessage = {
                role: 'system',
                content: `Available products for "${userMessage}": ${JSON.stringify(products)}`
            };

            const userChatMessage: ChatMessage = {
                role: 'user',
                content: userMessage
            };

            const updatedHistory = [...messageHistory, systemMessageWithProducts, userChatMessage];

            // Get AI response with retry logic
            let attempts = 0;
            const maxAttempts = 3;
            let botResponse = '';

            while (attempts < maxAttempts) {
                try {
                    const response = await fetch('https://qwen-qwq-32b.lepton.run/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiToken}`
                        },
                        body: JSON.stringify({
                            messages: updatedHistory,
                            model: 'qwen-qwq-32b',
                            temperature: 0.7,
                            max_tokens: 500
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    botResponse = data.choices?.[0]?.message?.content || formatProductResponse(products);
                    break;
                } catch (error) {
                    attempts++;
                    if (attempts === maxAttempts) {
                        // If all attempts fail, use the formatted product response
                        botResponse = formatProductResponse(products);
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
                }
            }

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: botResponse
            };

            setDisplayMessages(prev => [...prev, {
                sender: 'bot',
                text: botResponse,
                products: products
            }]);

            setMessageHistory(prev => [...prev, userChatMessage, assistantMessage]);

        } catch (error) {
            console.error('Error:', error);
            setError('Something went wrong. Please try again in a moment.');
        } finally {
            setIsLoading(false);
        }
    };

    const ProductDisplay = ({ products }: { products: Product[] }) => (
        <div className="grid grid-cols-1 gap-2 mt-2">
            {products.map((product) => (
                <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600"
                >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">${product.price.toFixed(2)}</div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div className="fixed bottom-auto md:bottom-4 top-4 md:top-auto right-4 z-40">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <button
                        onClick={() => setShowChatbot(!showChatbot)}
                        className="group p-2 bg-neutral-50 dark:bg-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-400 bg-opacity-20 dark:bg-opacity-20 hover:bg-opacity-50 dark:hover:bg-opacity-50 backdrop-blur-md rounded-lg transition-colors text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 duration-200"
                    >
                        <MessageCircle className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
                        <span className="sr-only">Toggle chatbot</span>
                    </button>
                </motion.div>
            </div>

            <AnimatePresence>
                {showChatbot && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 md:inset-auto md:bottom-20 md:right-4 md:w-96 md:h-[600px] bg-white dark:bg-neutral-800 md:rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col border border-neutral-200 dark:border-neutral-700"
                    >
                        <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                <h3 className="font-semibold">SMart Assistant</h3>
                            </div>
                            <button
                                onClick={() => setShowChatbot(false)}
                                className="p-2 hover:bg-primary-dark rounded-lg transition-colors duration-200"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close chatbot</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div
                                ref={chatRef}
                                className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden"
                            >
                                {displayMessages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`text-start max-w-[80%] break-words rounded-2xl px-4 py-2 shadow-sm ${
                                                message.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-bl-none'
                                            }`}
                                        >
                                            {message.sender === 'bot'
                                                ? formatMessageWithLinks(message.text)
                                                : message.text
                                            }
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-neutral-100 dark:bg-neutral-700 rounded-2xl px-4 py-1">
                                            <ThreeDotsWave />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="px-4 py-2 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                    <div className="flex-1 relative rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent focus-within:border-rose-300 dark:focus-within:border-rose-700 transition-colors">
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            disabled={isLoading}
                                            placeholder="Type your message..."
                                            className="w-full h-11 px-4 bg-transparent outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !userInput.trim()}
                                        className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="h-5 w-5" />
                                        <span className="sr-only">Send message</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;