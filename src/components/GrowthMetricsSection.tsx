import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// 1. Define Props Interface
interface TypewriterTextProps {
    text: string;
    delayStart?: number;
}

// --- Custom Component for Typewriter Effect ---
const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delayStart = 0 }) => {
    const letters = Array.from(text);

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.02,
                delayChildren: delayStart,
            },
        },
    };

    const child: Variants = {
        hidden: { opacity: 0, y: 5 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.1 },
        },
    };

    return (
        <motion.p
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            // Responsive font size: smaller on laptop, normal on desktop
            className="text-gray-600 text-[11px] lg:text-[13px] leading-snug font-medium min-h-[40px]"
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index}>
                    {letter}
                </motion.span>
            ))}
        </motion.p>
    );
};
// ----------------------------------------------

const GrowthMetricsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(0); // -1 = left, 1 = right

    const handleDragEnd = (_e: any, info: { offset: { x: number }; velocity: { x: number } }) => {
        const swipeThreshold = 50;
        const velocityThreshold = 300;
        if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
            // Swiped left → next card
            if (currentIndex < metrics.length - 1) {
                setSwipeDirection(1);
                setCurrentIndex(prev => prev + 1);
            }
        } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
            // Swiped right → previous card
            if (currentIndex > 0) {
                setSwipeDirection(-1);
                setCurrentIndex(prev => prev - 1);
            }
        }
    };

    const metrics = [
        {
            title: "Growth Oriented",
            percentage: 100,
            description: "Designed entirely to accelerate your personal brand and career trajectory.",
            pillColor: "linear-gradient(180deg, #285FFB 14.67%, #FFFFFF 94.67%)",
            mobileBg: "linear-gradient(180deg, #FFFFFF 15.02%, #4BBDFB 100%)",
            height: "450px",
        },
        {
            title: "Better Follow-ups",
            percentage: 70,
            description: "Digital profiles make it easier for people to find, remember, and message you back.",
            pillColor: "linear-gradient(180deg, #4BBDFB 0%, #FFFFFF 99.99%)",
            mobileBg: "linear-gradient(180deg, #F0FCFF 0%, #6082E9 99.99%)",
            height: "320px",
        },
        {
            title: "Increase in Connections",
            percentage: 42,
            description: "Accelerate your network growth with seamless sharing.",
            pillColor: "linear-gradient(180deg, #00D9FF 0%, #FFFFFF 100%)",
            mobileBg: "linear-gradient(180deg, #FFFFFF 0%, #5CC1E5 109.49%)",
            height: "220px",
        },
    ];

    useEffect(() => {
        // Breakpoint set to 1024px. 
        // 1024px and above = Desktop/Laptop View
        // Below 1024px = Mobile/Tablet View
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Native non-passive wheel listener for trackpad horizontal scroll
    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;
        let lastWheelTime = 0;
        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                const now = Date.now();
                if (now - lastWheelTime < 600) return;
                lastWheelTime = now;
                if (e.deltaX > 5) {
                    setSlideDirection(1);
                    setCurrentIndex(prev => Math.min(prev + 1, metrics.length - 1));
                } else if (e.deltaX < -5) {
                    setSlideDirection(-1);
                    setCurrentIndex(prev => Math.max(prev - 1, 0));
                }
            }
        };
        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [isMobile]);

    // --- Animation Variants ---

    const pillVariants: Variants = {
        hidden: { height: 0, opacity: 0 },
        visible: (customHeight: string) => ({
            height: customHeight,
            opacity: 1,
            transition: {
                duration: 1.0,
                ease: [0.22, 1, 0.36, 1] as const,
            },
        }),
    };

    const contentVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 1.2,
                duration: 0.6,
            },
        },
    };

    interface CircularProgressProps {
        percentage: number;
    }

    const CircularProgress: React.FC<CircularProgressProps> = ({ percentage }) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#2563EB"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        fill="transparent"
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute text-lg font-bold text-blue-700">
                    {percentage}%
                </span>
            </div>
        );
    };

    return (
        <section
            className="w-full flex flex-col items-center justify-center overflow-hidden"
            style={{
                background: isMobile
                    ? "#FFFFFF"
                    : "linear-gradient(10.2deg, #FFFFFF 33.27%, #BAE7FF 58.83%, #B1E4FF 78.18%, #4BBDFB 93.13%)",
                minHeight: isMobile ? "auto" : "100vh",
                paddingTop: isMobile ? "60px" : "80px",
                paddingBottom: isMobile ? "60px" : "0",
                paddingLeft: "0",
                paddingRight: "0",
            }}
        >
            <div className="w-full flex justify-center items-center py-4 md:py-0">
                {!isMobile ? (
                    <div className="flex flex-col items-center justify-center w-full pt-20">
                        {/* RESPONSIVE FIXES:
                           1. gap-[60px] on Laptop (lg), gap-[140px] on Big Screens (xl)
                           2. pr-[150px] on Laptop, pr-[400px] on Big Screens
                        */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ staggerChildren: 0.2 }}
                            className="flex items-end justify-center gap-[60px] xl:gap-[140px] px-4 xl:px-10 mx-auto w-full max-w-7xl xl:pr-[400px]" style={{ paddingRight: "12rem" }}
                        >
                            {metrics.map((item, index) => (
                                <motion.div
                                    key={index}
                                    // RESPONSIVE WIDTH: w-[170px] on Laptop, w-[220px] on Big Screens
                                    className="flex flex-col items-center w-[170px] xl:w-[220px] relative"
                                >
                                    {/* HEADER SECTION */}
                                    <div className="relative w-full flex flex-col items-center mb-4">

                                        {/* TEXT GROUP: Absolute Right */}
                                        {/* Reduced width for laptop so text wraps instead of cutting off */}
                                        <div className="absolute left-[80%] ml-3 xl:ml-6 bottom-0 w-[160px] xl:w-[220px] pointer-events-none">
                                            <motion.h3
                                                variants={contentVariants}
                                                className="text-lg xl:text-xl font-bold text-gray-900 mb-1 leading-none whitespace-nowrap"
                                            >
                                                {item.percentage}% {item.title}
                                            </motion.h3>
                                            <TypewriterText text={item.description} delayStart={1.5} />
                                        </div>

                                        {/* ARROW */}
                                        <motion.div variants={contentVariants} className="shrink-0">
                                            <img
                                                src="/assets/arroww.png"
                                                alt="arrow"
                                                // Responsive Arrow Size
                                                className="w-14 xl:w-20 h-auto opacity-80"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* PILLAR */}
                                    <motion.div
                                        custom={item.height}
                                        variants={pillVariants}
                                        className="w-full rounded-t-[100px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white relative z-10"
                                        style={{
                                            background: item.pillColor,
                                            WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                                            maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    // MOBILE VIEW
                    <div
                        ref={carouselRef}
                        className="flex flex-col items-center w-full px-8 overflow-hidden"
                        style={{ gap: "1.5rem", touchAction: "pan-y" }}
                        onTouchStart={(e) => {
                            (e.currentTarget as any)._touchStartX = e.touches[0].clientX;
                        }}
                        onTouchEnd={(e) => {
                            const startX = (e.currentTarget as any)._touchStartX;
                            const endX = e.changedTouches[0].clientX;
                            const diff = startX - endX;
                            if (Math.abs(diff) > 50) {
                                if (diff > 0) {
                                    setSlideDirection(1);
                                    setCurrentIndex(prev => Math.min(prev + 1, metrics.length - 1));
                                } else {
                                    setSlideDirection(-1);
                                    setCurrentIndex(prev => Math.max(prev - 1, 0));
                                }
                            }
                        }}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: swipeDirection * 200 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: swipeDirection * -200 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.3}
                                onDragEnd={handleDragEnd}
                                className="w-[92%] max-w-[380px] rounded-[24px] flex items-center justify-between shadow-lg relative overflow-hidden cursor-grab active:cursor-grabbing"
                                style={{
                                    background: metrics[currentIndex].mobileBg,
                                    border: "1.5px solid #a3c4f3",
                                    boxSizing: "border-box",
                                    minHeight: "200px",
                                    padding: "32px 28px",
                                    touchAction: "pan-y",
                                }}
                            >
                                <div className="text-left z-10 flex-1" style={{ paddingRight: "20px" }}>
                                    <h3 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: "14px" }}>
                                        {metrics[currentIndex].title}
                                    </h3>
                                    <p className="text-gray-600 text-[13px] font-medium" style={{ lineHeight: "1.6" }}>
                                        {metrics[currentIndex].description}
                                    </p>
                                </div>
                                <CircularProgress
                                    percentage={metrics[currentIndex].percentage}
                                />
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex gap-3 mt-12 mb-2">
                            {metrics.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSlideDirection(i > currentIndex ? 1 : -1);
                                        setCurrentIndex(i);
                                    }}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === i ? "w-8 bg-gray-600" : "w-2.5 bg-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GrowthMetricsSection;



