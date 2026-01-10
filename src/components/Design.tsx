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

    // 2. CARD 1: "Create your card" (Enters at 15%)
    // Scales down slightly when Card 2 overlaps it
    const card1Y = useTransform(scrollYProgress, [0.15, 0.4], ["100vh", "0vh"]);
    const card1Scale = useTransform(scrollYProgress, [0.45, 0.7], [1, 0.95]);

    // 3. CARD 2: "Share your card" (Enters at 50%)
    // This is now the last card, so it doesn't need to scale down
    const card2Y = useTransform(scrollYProgress, [0.5, 0.8], ["100vh", "0vh"]);

    return (
        // TRACK: Reduced height to 300vh since we only have 2 cards now
        <section
            ref={targetRef}
            className="relative h-[300vh]"
            style={{ background: "linear-gradient(0deg, #FFFFFF 0%, #A5E0FF 55%, #FFFFFF 100%)" }}
        >

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

                {/* --- 1. CARD ONE: Create your card --- */}
                <motion.div
                    style={{ y: card1Y, scale: card1Scale }}
                    className="absolute z-10 w-[95%] max-w-[1100px] h-[70vh] md:h-[40vh] rounded-[40px] shadow-2xl overflow-hidden  flex flex-col md:flex-row"
                >
                    {/* Text Side */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center" style={{ textAlign: "center", padding: "2rem", background: "linear-gradient(93.87deg, #FFFFFF 0%, #B0D2F0 48.25%, #83A1FE 90.76%);" }}>
                        <div className="text-center" style={{ height: "50%", width: "60%", margin: "auto", border: "3px solid #1070FF", borderRadius: "10px", padding: "1rem" }}>
                            <p className="text-[#06214A] text-2xl md:text-6xl font-bold  mb-8 leading-relaxed">
                                Personalize your own digital business cards with your headshot, logo and slick design templates. New job title? New logo? No problem.
                            </p>
                        </div>



                    </div>
                </motion.div>

                {/* --- 2. CARD TWO: Share your card --- */}
                <motion.div
                    style={{ y: card2Y }}
                    className="absolute z-20 w-[95%] max-w-[1100px] h-[70vh] md:h-[40vh] rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-200 flex flex-col-reverse md:flex-row"
                >
                    {/* Text Side */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center" style={{ textAlign: "center", padding: "1rem", background: "radial-gradient(65.11% 65.11% at 50% 50%, #0C2160 0%, #173CAA 57.27%, #6854FF 94.29%)" }}>
                        <p className=" text-2xl md:text-6xl font-bold mb-8 leading-relaxed" style={{ color: "white", padding: "1rem" }}>
                            MyKard is your smart digital profile designed to help you get discovered and grow your network.
                            Whether you're a freelancer or a CEO, replace scattered links and physical cards with one powerful QR code that tells your story
                        </p>

                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default MyKardStack;