"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MyKardStack = () => {
    const router = useRouter();
    const [buttonLoading, setButtonLoading] = useState(false);

    const handleCreateCard = async () => {
        try {
            setButtonLoading(true);
            const res = await fetch("/api/profile/getuser", { credentials: "include" });

            if (!res.ok) {
                // Not logged in
                router.push("/auth/signup");
                return;
            }

            const data = await res.json();

            if (!data.isAuthenticated) {
                router.push("/auth/signup");
                return;
            }

            // Check if user has cards
            const users = data.users || [];
            const currentUser = users[0];
            const hasCards = currentUser?.cards && currentUser.cards.length > 0;

            if (hasCards) {
                router.push("/visitingCard");
            } else {
                router.push("/onboarding");
            }
        } catch {
            // Network error or not authenticated
            router.push("/auth/signup");
        } finally {
            setButtonLoading(false);
        }
    };

    return (
        <section
            className="relative pt-16 pb-24 md:pt-24 md:pb-32"
            style={{
                background: "transparent"
            }}
        >
            <div className="container mx-auto px-6 flex flex-col items-center gap-10 md:gap-14">

                {/* 1. Main Heading */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center w-full"
                >
                    <h2 className="text-[#1E3A8A] text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-tight tracking-tighter mx-auto max-w-[95%] whitespace-normal break-words md:whitespace-nowrap">
                        MyKard isn't just a Digital Card
                    </h2>
                </motion.div>

                {/* 2. "Made in India" Box — compact on desktop */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="bg-[#f0f9ff] border-2 border-[#1070FF] rounded-[24px] md:rounded-[28px] text-center shadow-lg relative flex items-center justify-center"
                    style={{ width: "min(95%, 900px)", padding: "20px 25px" }}
                >
                    <p className="text-[#030b25] text-lg md:text-2xl lg:text-3xl font-semibold leading-relaxed relative z-10 px-2 md:px-6 max-w-[800px] mx-auto">
                        Made in India, for the world — <strong>MyKard</strong> is the modern way to network, connect, and build your personal brand.
                    </p>
                </motion.div>

                {/* 3. Blue Info Card — wider on desktop, with button */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center mx-auto shadow-xl text-center"
                    style={{
                        background: "linear-gradient(180deg, #3282FF 0%, #6AB2FF 100%)",
                        width: "min(95%, 900px)",
                        borderRadius: "24px",
                        padding: "40px 32px",
                    }}
                >
                    <h3 style={{ fontSize: "clamp(16px, 2.5vw, 24px)", fontWeight: "600", lineHeight: "1.45", marginBottom: "20px", color: "#FFFFFF", maxWidth: "90%", textAlign: "center" }}>
                        MyKard is your smart digital profile designed to help you get discovered and grow your network.
                    </h3>

                    {/* Divider bar */}
                    <div style={{ width: "45px", height: "3px", backgroundColor: "#1c64df", borderRadius: "2px", marginBottom: "16px" }}></div>

                    <p style={{ fontSize: "clamp(13px, 2vw, 18px)", fontWeight: "500", lineHeight: "1.65", color: "#FFFFFF", maxWidth: "85%", textAlign: "center", margin: "0 0 28px 0" }}>
                        Whether you're a freelancer or a CEO, replace scattered links and physical cards with one powerful QR code that tells your story.
                    </p>

                    {/* Create your MyKard Button */}
                    <button
                        onClick={handleCreateCard}
                        disabled={buttonLoading}
                        className="inline-flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
                        style={{
                            background: "#225af5",
                            color: "#FFFFFF",
                            borderRadius: "30px",
                            padding: "12px 28px",
                            fontSize: "clamp(13px, 2vw, 16px)",
                            fontWeight: 700,
                            border: "none",
                            cursor: buttonLoading ? "wait" : "pointer",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            gap: "8px",
                            opacity: buttonLoading ? 0.7 : 1,
                        }}
                    >
                        {buttonLoading ? "Loading..." : "Create your MyKard"}
                        {!buttonLoading && (
                            <svg width="16" height="16" viewBox="0 0 20 17" fill="none">
                                <path
                                    d="M4.16663 8.50008H15.8333M15.8333 8.50008L9.99996 3.54175M15.8333 8.50008L9.99996 13.4584"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </button>
                </motion.div>

            </div>
        </section>
    );
};

export default MyKardStack;