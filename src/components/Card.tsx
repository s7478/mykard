import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const MyKardStack = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"],
    });

    // --- ANIMATION LOGIC ---

    // 1. HERO TEXT (Background)
    // Fades out as the first card appears
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // 2. CARD 1: "Create your card" (Enters at 15%, sits at center)
    // Scales down slightly when Card 2 overlaps it
    const card1Y = useTransform(scrollYProgress, [0.15, 0.35], ["100vh", "0vh"]);
    const card1Scale = useTransform(scrollYProgress, [0.4, 0.6], [1, 0.95]);

    // 3. CARD 2: "Share your card" (Enters at 45%, sits at center)
    // Scales down slightly when Card 3 overlaps it
    const card2Y = useTransform(scrollYProgress, [0.45, 0.65], ["100vh", "0vh"]);
    const card2Scale = useTransform(scrollYProgress, [0.7, 0.9], [1, 0.95]);

    // 4. CARD 3: "Never forget a face" (Enters at 75%, sits at center)
    const card3Y = useTransform(scrollYProgress, [0.75, 0.95], ["100vh", "0vh"]);

    return (
        // TRACK: Height 400vh to accommodate 3 cards + hero text scrolling comfortably
        <section ref={targetRef} className="relative h-[400vh] bg-[#f5f5f7]">

            {/* STICKY VIEWPORT (100vh) */}
            <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center perspective-1000">

                {/* --- 0. BACKGROUND HERO TEXT --- */}
                <motion.div
                    style={{ scale: heroScale, opacity: heroOpacity }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-0 px-4"
                >
                    <h2 className="text-[#06214A] text-4xl md:text-7xl font-extrabold text-center leading-tight">
                        MyKard isn’t just a <br /> Digital Card
                    </h2>
                </motion.div>

                {/* --- 1. CARD ONE: Create your card (Text Left, Video Right) --- */}
                <motion.div
                    style={{ y: card1Y, scale: card1Scale }}
                    className="absolute z-10 w-[95%] max-w-[1100px] h-[70vh] md:h-[80vh] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row"
                >
                    {/* Text Side */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Create your card in seconds
                        </h3>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Personalize your own digital business cards with your headshot, logo and slick design templates. New job title? New logo? No problem.
                        </p>
                        <button className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg w-fit hover:bg-red-600 transition">
                            Start free trial
                        </button>
                    </div>
                    {/* Video Side */}
                    <div className="flex-1 bg-gray-50 relative overflow-hidden">
                        <video
                            className="w-full h-full object-cover"
                            autoPlay loop muted playsInline
                            poster="https://cdn.prod.website-files.com/617ac0d059899a9a3c8216e9/6938c4a9a43574befcd129a5_BLQ62_HomePage_Web_Create_1440x1112_MP4_R1_V01_poster.0000000.jpg"
                        >
                            <source src="https://cdn.prod.website-files.com/617ac0d059899a9a3c8216e9/6938c4a9a43574befcd129a5_BLQ62_HomePage_Web_Create_1440x1112_MP4_R1_V01_mp4.mp4" type="video/mp4" />
                        </video>
                    </div>
                </motion.div>

                {/* --- 2. CARD TWO: Share your card (Video Left, Text Right) --- */}
                <motion.div
                    style={{ y: card2Y, scale: card2Scale }}
                    className="absolute z-20 w-[95%] max-w-[1100px] h-[70vh] md:h-[80vh] bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-200 flex flex-col-reverse md:flex-row"
                >
                    {/* Video Side (Left for variety) */}
                    <div className="flex-1 bg-gray-50 relative overflow-hidden">
                        <video
                            className="w-full h-full object-cover"
                            autoPlay loop muted playsInline
                            poster="https://cdn.prod.website-files.com/617ac0d059899a9a3c8216e9/6938c5628f91a7cb8b66a32b_BLQ62_HomePage_Web_Share_1440x1112_MP4_R1_V01_poster.0000000.jpg"
                        >
                            <source src="https://cdn.prod.website-files.com/617ac0d059899a9a3c8216e9/6938c5628f91a7cb8b66a32b_BLQ62_HomePage_Web_Share_1440x1112_MP4_R1_V01_mp4.mp4" type="video/mp4" />
                        </video>
                    </div>
                    {/* Text Side */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-gray-50 md:bg-white">
                        <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Share your card with anyone, any way
                        </h3>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Scan. Tap. Done. QR, NFC, or link - your details land instantly even if they don't have the app.
                        </p>
                        <button className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg w-fit hover:bg-red-600 transition">
                            Start free trial
                        </button>
                    </div>
                </motion.div>

                {/* --- 3. CARD THREE: Never forget (Text Left, Video Right) --- */}
                <motion.div
                    style={{ y: card3Y }}
                    className="absolute z-30 w-[95%] max-w-[1100px] h-[70vh] md:h-[80vh] bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-gray-200 flex flex-col md:flex-row"
                >
                    {/* Text Side */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Never forget a face, or a moment
                        </h3>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Blinq keeps track of who you met and when. Add context to your contacts so you always have an edge.
                        </p>
                        <button className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg w-fit hover:bg-red-600 transition">
                            Start free trial
                        </button>
                    </div>
                    {/* Video Side */}
                    <div className="flex-1 bg-gray-50 relative overflow-hidden">
                        <video
                            className="w-full h-full object-cover"
                            autoPlay loop muted playsInline
                            poster="https://cdn.prod.website-files.com/617ac0d059899a9a3c8216e9/6938c592fc2e3562e632ddc5_BLQ62_HomePage_Web_Context_1440x1112_MP4_R1_V01_poster.0000000.jpg"
                        >
                            <source src="https://cdn.prod.website-files.com/617ac0d059899a9a3c8216e9/6938c592fc2e3562e632ddc5_BLQ62_HomePage_Web_Context_1440x1112_MP4_R1_V01_mp4.mp4" type="video/mp4" />
                        </video>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default MyKardStack;