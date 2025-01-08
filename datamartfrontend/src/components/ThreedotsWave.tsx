import React from "react";
import { motion } from "framer-motion";

const loadingContainer = {
    width: "2rem",
    height: "2rem",
    display: "flex",
    justifyContent: "space-around"
};

const loadingCircle = {
    display: "block",
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "0.25rem"
};

const loadingContainerVariants = {
    start: {
        transition: {
            staggerChildren: 0.1
        }
    },
    end: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const loadingCircleVariants = {
    start: {
        y: "0%"
    },
    end: {
        y: "100%"
    }
};

const loadingCircleTransition = {
    duration: 0.4,
    yoyo: Infinity,
    ease: "easeInOut"
};

export const ThreeDotsWave = () => {
    return (
        <motion.div
            style={loadingContainer}
            variants={loadingContainerVariants}
            initial="start"
            animate="end"
        >
            {[0, 1, 2].map((index) => (
                <motion.span
                    key={index}
                    style={loadingCircle}
                    variants={loadingCircleVariants}
                    transition={loadingCircleTransition}
                    className="bg-neutral-600 dark:bg-neutral-300"
                />
            ))}
        </motion.div>
    );
};

