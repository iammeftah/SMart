import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github } from 'lucide-react';

// Import team member images
import hmedImage from '../assets/team/hmed-image.jpg';
import ismailImage from '../assets/team/ismail-image.jpg';

interface TeamMember {
    name: string;
    role: string;
    bio: string;
    image: string;
    initials: string;
    github: string;
    email: string;
}

const teamMembers: TeamMember[] = [
    {
        name: "Meftah Ahmed Reda",
        role: "Software Engineer Student",
        bio: "A passionate fullstack developer with a keen interest in frontend technologies. Brings creativity and technical expertise to every project, constantly exploring new ways to enhance user experiences through innovative web solutions.",
        image: hmedImage,
        initials: "MA",
        github: "https://github.com/iammeftah",
        email: "meftahahmedreda02@gmail.com"
    },
    {
        name: "Ourakh Ismail",
        role: "Software Engineer Student",
        bio: "Specializing in backend development with a growing interest in system architecture. With analytical approach and problem-solving skills contribute to building robust and scalable applications.",
        image: ismailImage,
        initials: "OI",
        github: "https://github.com/ismailourakh",
        email: "ourakhismail@gmail.com"
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5
        }
    }
};

const About: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
            {/* Hero Section */}
            <motion.section
                className="relative flex items-center h-[50vh] overflow-hidden bg-gradient-to-r from-rose-600 to-fuchsia-700 dark:from-rose-800 dark:to-fuchsia-900 py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        About Our <span className="text-yellow-300">AI-Powered</span> Shopping Platform
                    </motion.h1>
                    <motion.p
                        className="text-lg text-rose-100 max-w-2xl mx-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        Discover the story behind our innovative approach to online shopping and the team that makes it possible.
                    </motion.p>
                </div>
            </motion.section>

            {/* About Our Application Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.h2
                        className="text-3xl font-bold text-white mb-8"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Our Mission
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <p className="text-lg text-neutral-300 mb-6">
                            At AI Shopping Assistant, we're revolutionizing the online shopping experience by harnessing the power of artificial intelligence. Our platform learns from user preferences to provide personalized product recommendations, making shopping easier and more enjoyable than ever before.
                        </p>
                        <p className="text-lg text-neutral-300">
                            We believe that technology should simplify and enhance our lives. That's why we've developed an intuitive, AI-driven system that understands your unique tastes and needs, helping you discover products you'll love without the hassle of endless searching.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Team Members Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.h2
                        className="text-3xl font-bold text-white mb-12 text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Meet Our Team
                    </motion.h2>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-neutral-800 rounded-lg p-8 flex flex-col items-center text-center group hover:bg-neutral-700 transition-colors duration-300"
                            >
                                <div className="mb-6">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-rose-500 hover:border-rose-400 transition-colors duration-300"
                                    />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-2">{member.name}</h3>
                                <p className="text-rose-400 mb-4">{member.role}</p>
                                <p className="text-neutral-300 mb-6">{member.bio}</p>
                                <div className="flex items-center justify-center space-x-4 w-full mt-auto">
                                    <motion.a
                                        href={member.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-300 hover:text-rose-400 transition-colors duration-200"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Github className="w-6 h-6" />
                                    </motion.a>
                                    <motion.a
                                        href={`mailto:${member.email}`}
                                        className="text-neutral-300 hover:text-rose-400 transition-colors duration-200"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Mail className="w-6 h-6" />
                                    </motion.a>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                className="py-16 bg-gradient-to-r from-rose-600 to-fuchsia-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.h2
                        className="text-3xl sm:text-4xl font-bold text-white mb-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Ready to Transform Your Shopping Experience?
                    </motion.h2>
                    <motion.p
                        className="text-rose-100 mb-8 max-w-2xl mx-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        Join us in revolutionizing online shopping with AI-powered recommendations.
                    </motion.p>
                    <a href="/store">
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className="outline-none px-8 py-4 bg-white hover:bg-neutral-100 text-rose-600 rounded-full font-medium transition-colors inline-flex items-center space-x-2"
                        >
                            <span>Get Started Now</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                      clipRule="evenodd"/>
                            </svg>
                        </motion.button>
                    </a>
                </div>
            </motion.section>
        </div>
    );
};

export default About;

