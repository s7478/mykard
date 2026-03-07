import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const MyKardStack = () => {
    return (
        <section
            className="relative pt-24 pb-48 md:pt-40 md:pb-56"
            style={{
                background: "linear-gradient(180deg, #6ab2ff 0%, #D1E9FF 40%, #FFFFFF 100%)"
            }}
        >
            <div className="container mx-auto px-6 flex flex-col items-center gap-12 md:gap-20">

                {/* 1. Main Heading */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center w-full"
                >
                    <h2 className="text-[#1E3A8A] text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-tight tracking-tighter mx-auto max-w-[95%]">
                        MyKard isn’t just a <br className="hidden md:block" /> Digital Card
                    </h2>
                </motion.div>

                {/* 2. "Made in India" Box */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="w-[95%] max-w-[850px] bg-[#f0f9ff] border-2 border-[#1070FF] rounded-[32px] p-10 md:p-16 text-center shadow-lg relative flex items-center justify-center min-h-[180px] md:min-h-[250px]"
                >
                    <p className="text-[#030b25] text-xl md:text-3xl lg:text-4xl font-semibold leading-relaxed relative z-10 px-4 max-w-[750px] mx-auto">
                        Made in India, for the world — <br className="hidden md:block" />
                        MyKard is the modern way to network, connect, and build your personal brand.
                    </p>
                </motion.div>

                {/* 3. Blue Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center mx-auto shadow-xl text-center"
                    style={{
                        background: "linear-gradient(180deg, #3282FF 0%, #6AB2FF 100%)",
                        width: "min(88%, 610px)",
                        borderRadius: "24px",
                        padding: "35px 5px",
                    }}
                >
                    <h3 style={{ fontSize: "20px", fontWeight: "600", lineHeight: "1.45", marginBottom: "20px", color: "#FFFFFF", maxWidth: "90%", textAlign: "center" }}>
                        MyKard is your smart digital profile designed to help you get discovered and grow your network.
                    </h3>

                    {/* Divider bar */}
                    <div style={{ width: "45px", height: "3px", backgroundColor: "#1c64df", borderRadius: "2px", marginBottom: "20px" }}></div>

                    <p style={{ fontSize: "15px", fontWeight: "500", lineHeight: "1.65", color: "#FFFFFF", maxWidth: "85%", textAlign: "center", margin: 0 }}>
                        Whether you're a freelancer or a CEO, replace scattered links and physical cards with one powerful QR code that tells your story.
                    </p>
                </motion.div>

            </div>
        </section>
    );
};

export default MyKardStack;