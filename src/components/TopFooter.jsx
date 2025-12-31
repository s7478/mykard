"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const TopFooter = () => {
  const router = useRouter();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const TWO_PI = Math.PI * 2;
    // You can change these emojis to whatever you like!
    const emojiList = ["👻", "✨", "🔥", "🚀", "⭐", "💎"];

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    class Vector2D {
      constructor(x, y) {
        this._x = x;
        this._y = y;
      }
      setX(x) { this._x = x; }
      setY(y) { this._y = y; }
      getX() { return this._x; }
      getY() { return this._y; }
      setAngle(angle) {
        const length = this.getLength();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
      }
      getAngle() { return Math.atan2(this._y, this._x); }
      setLength(length) {
        const angle = this.getAngle();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
      }
      getLength() { return Math.sqrt(this._x * this._x + this._y * this._y); }
      addTo(v2) {
        this._x += v2.getX();
        this._y += v2.getY();
      }
    }

    class FloatingEmoji {
      constructor(x, y, context) {
        this.position = new Vector2D(x, y);
        this.context = context;
        this.emoji = emojiList[getRandomInt(0, emojiList.length - 1)];
        
        // Randomize size and floating behavior
        this.size = getRandomInt(30, 50);
        this.bodyBounceAngle = getRandomInt(0, 100);
        this.bounceSpeed = 0.03 + Math.random() * 0.04;
        this.bounceDistance = 0.5 + Math.random() * 0.5;

        this.velocity = new Vector2D(0, 0);
        this.velocity.setLength(Math.random() * 1.5 + 0.5);
        this.velocity.setAngle(Math.random() * TWO_PI);
      }

      update(mousePosition) {
        // Change direction occasionally
        if (Math.random() < 0.01) {
          this.velocity.setAngle(Math.random() * TWO_PI);
        }

        const bodyBounce = new Vector2D(
          0,
          Math.sin(this.bodyBounceAngle) * this.bounceDistance
        );

        this.position.addTo(bodyBounce);
        this.position.addTo(this.velocity);

        // Screen wrap-around
        if (this.position.getX() < -50) this.position.setX(window.innerWidth + 50);
        if (this.position.getX() > window.innerWidth + 50) this.position.setX(-50);
        if (this.position.getY() < -50) this.position.setY(window.innerHeight + 50);
        if (this.position.getY() > window.innerHeight + 50) this.position.setY(-50);

        this.bodyBounceAngle += this.bounceSpeed;
      }

      render() {
        this.context.font = `${this.size}px serif`;
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(
          this.emoji,
          this.position.getX(),
          this.position.getY()
        );
      }
    }

    const ghosts = [];
    const numberOfGhosts = Math.round((window.innerWidth + window.innerHeight) / 300);

    for (let i = 0; i < numberOfGhosts; i++) {
      const ghost = new FloatingEmoji(
        getRandomInt(0, window.innerWidth),
        getRandomInt(0, window.innerHeight),
        context
      );
      ghosts.push(ghost);
    }

    const loop = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      ghosts.forEach((ghost) => {
        ghost.update();
        ghost.render();
      });
      requestAnimationFrame(loop);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const letters = ["C", "R", "E", "A", "T", "E", " ", "Y", "O", "U", "R", " ", "C", "A", "R", "D"];

  const handleGetInTouch = () => {
    router.push('/contact');
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#3785b2] via-[#165dc9] to-[#111827] relative rounded-t-[50px] md:rounded-t-[80px] w-full pb-20 min-h-[400px]">
      {/* Canvas Layer */}
      <canvas 
        className="absolute inset-0 w-full h-full md:block hidden pointer-events-none" 
        ref={canvasRef}
      ></canvas>

      {/* Button Layer */}
      <motion.div
        className="relative z-10 flex items-center justify-center w-[65%] max-w-[800px] md:h-[300px] bg-transparent border-4 border-white rounded-2xl shadow-xl overflow-hidden p-4 group mt-10 md:mt-16 cursor-pointer"
        initial="scatter"
        whileHover="align"
        variants={containerVariants}
        onClick={handleGetInTouch}
      >
        <div className="hidden md:flex flex-wrap justify-center items-center">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className={`text-[clamp(2rem,6vw,5rem)] font-serif font-bold text-white transition-all duration-300 group-hover:text-black mr-[8px] md:mr-[12px] ${letter === " " ? "w-[20px] md:w-[30px]" : ""}`}
              custom={index}
              variants={letterVariants}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>
        <div className="md:hidden flex items-center justify-center w-full py-3 px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border-2 border-white/30 shadow-lg px-6 py-3 hover:bg-white/20 transition-all duration-300">
            <span className="text-white text-xl font-semibold">CREATE YOUR CARD</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const containerVariants = { scatter: {}, align: {} };

const letterVariants = {
  scatter: () => ({
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
    rotate: Math.random() * 60 - 30,
    transition: { duration: 0.1 },
  }),
  align: () => ({
    x: 0,
    y: 0,
    rotate: 0,
    transition: { duration: 0.1 },
  }),
};

export default TopFooter;
