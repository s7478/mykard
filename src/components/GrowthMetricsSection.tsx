import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";



const GrowthMetricsSection = () => {

    // UPDATED: High-end professional transition variants

    const containerVariants = {

        hidden: {

            x: 100, // Starts from further right

            opacity: 0,

        },

        visible: {

            x: 0,

            opacity: 1,

            transition: {

                duration: 1.2, // Slightly longer for a more "expensive" feel

                ease: [0.22, 1, 0.36, 1], // Quintic ease-out: very fast start, ultra-smooth finish

                when: 'beforeChildren',

                staggerChildren: 0.12

            }

        }

    } as const;



    const itemVariants = {

        hidden: {

            y: 20,

            opacity: 0,

        },

        visible: {

            y: 0,

            opacity: 1,

            transition: {

                duration: 0.8,

                ease: [0.22, 1, 0.36, 1]

            }

        }

    } as const;



    const [currentIndex, setCurrentIndex] = useState(0);

    const [isMobile, setIsMobile] = useState(false);



    const metrics = [
        {
            title: "Growth Oriented",
            percentage: 100,
            description: "Designed entirely to accelerate your personal brand and career trajectory.",
            pillColor: "linear-gradient(180deg, #285FFB 14.67%, #FFFFFF 94.67%)", // Desktop color
            mobileBg: "linear-gradient(180deg, #FFFFFF 15.02%, #4BBDFB 100%)",   // NEW Mobile color
            height: "450px",
        },
        {
            title: "Better Follow-ups",
            percentage: 70,
            description: "Digital profiles make it easier for people to find, remember, and message you back.",
            pillColor: "linear-gradient(180deg, #4BBDFB 0%, #FFFFFF 99.99%)",
            mobileBg: "linear-gradient(180deg, #F0FCFF 0%, #6082E9 99.99%)",     // NEW Mobile color
            height: "320px",
        },
        {
            title: "Increase in Professional Connections",
            percentage: 42,
            description: "Accelerate your network growth with seamless, one-tap sharing that eliminates manual entry.",
            pillColor: "linear-gradient(180deg, #00D9FF 0%, #FFFFFF 100%)",
            mobileBg: "linear-gradient(180deg, #FFFFFF 0%, #5CC1E5 109.49%)",    // NEW Mobile color
            height: "220px",
        },
    ];



    useEffect(() => {

        const handleResize = () => setIsMobile(window.innerWidth < 768);

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);

    }, []);



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

                    <circle cx="50%" cy="50%" r={radius} stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="transparent" />

                    <motion.circle

                        initial={{ strokeDashoffset: circumference }}

                        whileInView={{ strokeDashoffset: offset }}

                        transition={{ duration: 1.5, ease: "easeOut" }}

                        cx="50%" cy="50%" r={radius}

                        stroke="#2563EB" strokeWidth="8" strokeDasharray={circumference}

                        fill="transparent" strokeLinecap="round"

                    />

                </svg>

                <span className="absolute text-lg font-bold text-blue-700">{percentage}%</span>

            </div>

        );

    };



    return (

        <motion.section

            initial="hidden"

            animate="visible"

            variants={containerVariants}

            className="w-full flex flex-col items-center justify-center overflow-hidden"

            style={{

                background: isMobile ? "#FFFFFF" : "linear-gradient(10.2deg, #FFFFFF 33.27%, #BAE7FF 58.83%, #B1E4FF 78.18%, #4BBDFB 93.13%)",

                minHeight: isMobile ? "auto" : "100vh",

                padding: isMobile ? "2rem 0" : "0",

            }}

        >

            <div className="w-full flex justify-center items-center py-4 md:py-0">

                {!isMobile ? (

                    <div className="flex flex-col items-center justify-center w-full pt-20">

                        <div className="flex items-end justify-center gap-[100px] px-20 mx-auto w-full max-w-7xl">

                            {metrics.map((item, index) => (

                                <motion.div

                                    key={index}

                                    variants={itemVariants}

                                    className="flex flex-col items-start w-[240px]"

                                >

                                    <div className="mb-6 px-2">

                                        <h3 className="text-xl font-bold text-gray-900 mb-2 whitespace-nowrap">

                                            {item.percentage}% {item.title}

                                        </h3>

                                        <p className="text-gray-600 text-[13px] leading-snug font-medium min-h-[40px]">

                                            {item.description}

                                        </p>

                                        <div className="mt-4">

                                            <img

                                                src="/assets/arroww.png"

                                                alt="arrow"

                                                className="w-10 h-auto opacity-80"

                                            />

                                        </div>

                                    </div>



                                    <div

                                        className="w-full rounded-t-[100px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border-4 border-white relative z-10 "

                                        style={{

                                            height: item.height,

                                            background: item.pillColor,

                                            WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",

                                            maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",

                                        }}

                                    />

                                </motion.div>

                            ))}

                        </div>

                    </div>

                ) : (

                    <div className="flex flex-col items-center w-full px-8" style={{ gap: '1.5rem' }}>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-[85%] max-w-[320px] aspect-[16/11] rounded-[35px] p-6 flex items-center justify-between shadow-lg relative overflow-hidden"
                                style={{
                                    // Updated to use the specific gradient from the array
                                    background: metrics[currentIndex].mobileBg,
                                    border: "2px solid #000000", // Applied the 2px solid black border
                                    boxSizing: "border-box",
                                }}
                            >
                                <div className="text-left z-10 pr-4">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{metrics[currentIndex].title}</h3>
                                    <p className="text-gray-700 text-sm font-medium">{metrics[currentIndex].description}</p>
                                </div>
                                <CircularProgress percentage={metrics[currentIndex].percentage} />
                            </motion.div>
                        </AnimatePresence>



                        <div className="flex gap-3 mt-12 mb-2">

                            {metrics.map((_, i) => (

                                <button

                                    key={i}

                                    onClick={() => setCurrentIndex(i)}

                                    className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === i ? "w-8 bg-gray-600" : "w-2.5 bg-gray-300"

                                        }`}

                                />

                            ))}

                        </div>

                    </div>

                )}

            </div>

        </motion.section>

    );

};



export default GrowthMetricsSection;
