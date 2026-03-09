'use client';

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Changed from react-router-dom


const TopFooter = () => {

  const router = useRouter(); // Changed from useNavigate()
  const canvasRef = useRef(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    // Check if canvas exists before accessing context to prevent errors
    if (!canvas) return;

    const context = canvas.getContext("2d");

    const TWO_PI = Math.PI * 2;
    // You can change these emojis to whatever you like!
    const emojiList = ["💳", // card
      "📱", // mobile
      "👤", // profile
      "📇", // contact card
      "📎", // attachment
      "🔐", // security
      "📊", // analytics
    ];

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    class Vector2D {
      constructor(x, y) {
        this._x = x;
        this._y = y;
      }
      setX(x) {
        this._x = x;
      }
      setY(y) {
        this._y = y;
      }
      getX() {
        return this._x;
      }
      getY() {
        return this._y;
      }
      setAngle(angle) {
        const length = this.getLength();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
      }
      getAngle() {
        return Math.atan2(this._y, this._x);
      }
      setLength(length) {
        const angle = this.getAngle();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
      }
      getLength() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
      }
      addTo(v2) {
        this._x += v2.getX();
        this._y += v2.getY();
      }
      subtractFrom(v2) {
        this._x -= v2.getX();
        this._y -= v2.getY();
      }
    }

    class Eye {
      constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.irisPosition = new Vector2D(x, y);
        this.moveRadius = 20;
        this.sizeRadius = 5;
      }
      update(velocity, angle) {
        this.position.addTo(velocity);
        this.irisPosition.setX(
          this.position.getX() + Math.cos(angle) * this.moveRadius
        );
        this.irisPosition.setY(
          this.position.getY() + Math.sin(angle) * this.moveRadius
        );
      }
      render(context) {
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(
          this.irisPosition.getX(),
          this.irisPosition.getY(),
          this.sizeRadius,
          0,
          TWO_PI
        );
        context.fill();
      }
    }

    class Ghost {
      constructor(x, y, context) {
        this.position = new Vector2D(x, y);
        this.handPosition = new Vector2D(x, y);
        this.context = context;

        this.radius = 50;
        this.eyeDistance = 10;
        this.eyes = [];
        this.bodyBounceAngle = getRandomInt(0, 100);
        this.bounceDistance = 0.5;
        this.bounceSpeed = 0.05;

        this.velocity = new Vector2D(0, 0);
        this.velocity.setLength(Math.random() * 2 + 1);
        this.velocity.setAngle(Math.random() * TWO_PI);
      }

      initialize() {
        this.eyes.push(
          new Eye(
            this.position.getX() - this.eyeDistance,
            this.position.getY() - 10
          )
        );
        this.eyes.push(
          new Eye(
            this.position.getX() + this.eyeDistance,
            this.position.getY() - 10
          )
        );
      }

      update(mousePosition) {
        if (Math.random() < 0.01) {
          this.velocity.setLength(Math.random() * 2 + 1);
          this.velocity.setAngle(Math.random() * TWO_PI);
        }

        const bodyBounce = new Vector2D(
          0,
          Math.sin(this.bodyBounceAngle) * this.bounceDistance
        );
        const handBounce = new Vector2D(
          0,
          (Math.sin(this.bodyBounceAngle + 10) * this.bounceDistance) / 2
        );
        this.position.addTo(bodyBounce);
        this.handPosition.subtractFrom(handBounce);

        const dx = mousePosition.x - this.position.getX();
        const dy = mousePosition.y - this.position.getY();
        const angle = Math.atan2(dy, dx);

        for (let i = 0; i < this.eyes.length; i++) {
          this.eyes[i].update(bodyBounce, angle);
        }

        this.bodyBounceAngle += this.bounceSpeed;
      }

      render() {
        this.context.fillStyle = "#ffffff";
        this.context.beginPath();
        this.context.arc(
          this.position.getX(),
          this.position.getY(),
          this.radius,
          0,
          TWO_PI
        );
        this.context.fill();

        this.context.fillStyle = "#ffffff";
        this.context.beginPath();
        this.context.arc(
          this.handPosition.getX() - this.radius + 5,
          this.handPosition.getY() + 10,
          10,
          0,
          TWO_PI
        );
        this.context.fill();

        this.context.fillStyle = "#ffffff";
        this.context.beginPath();
        this.context.arc(
          this.handPosition.getX() + this.radius - 5,
          this.handPosition.getY() + 10,
          10,
          0,
          TWO_PI
        );
        this.context.fill();

        for (let i = 0; i < this.eyes.length; i++) {
          this.eyes[i].render(this.context);
        }
      }
    }

    const mousePosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const ghosts = [];
    const numberOfGhosts = Math.round(
      (window.innerWidth + window.innerHeight) / 200
    );

    for (let i = 0; i < numberOfGhosts; i++) {
      const ghost = new Ghost(
        getRandomInt(0, window.innerWidth),
        getRandomInt(0, window.innerHeight),
        context
      );
      ghost.initialize();
      ghosts.push(ghost);
    }

    const update = () => {
      for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].update(mousePosition);
      }
    };

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].render();
      }
    };

    const loop = () => {
      update();
      render();
      requestAnimationFrame(loop);
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    loop();

    const handleMouseMove = (e) => {
      mousePosition.x = e.clientX;
      mousePosition.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const letters = ["C", "R", "E", "T", "E", " ", "Y", "O", "U", "R", " ", "C", "A", "R", "D"];

  return (
    <div className="relative w-full overflow-hidden">

      {/* 🔹 FULL WIDTH BACKGROUND (gap yahin fill hoga) */}
      <div
        aria-hidden
        className="
      absolute
      top-0 left-1/2 -translate-x-1/2
      w-full h-full
      bg-gradient-to-b from-[#01071E] via-[#165dc9] to-[#2152E5]
    "
      />

      {/* 🔹 ACTUAL ROUNDED SECTION */}
      <div
        className="
      relative z-10
      flex flex-col items-center justify-center
      rounded-t-[50px] md:rounded-t-[80px]
      bg-gradient-to-b from-[#01071E] via-[#165dc9] to-[#2152E5]
      pb-20 min-h-[400px]
      overflow-hidden
    "
      >

        {/* Canvas Layer */}
        <canvas
          className="absolute inset-0 w-full h-full md:block hidden pointer-events-none"
          ref={canvasRef}
        ></canvas>

        {/* Button Layer */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-[90%] max-w-[800px] md:h-[300px] h-auto bg-transparent border-4 border-white rounded-2xl shadow-xl overflow-hidden p-4 group mt-10 md:mt-16 cursor-pointer"
          initial="scatter"
          whileHover="align"
          variants={containerVariants}
          onClick={() => {
            router.push('/contact'); // Changed from navigate
          }}
        >
          <div className="absolute inset-0 z-[-1] animate-pulse group-hover:bg-white blur-3xl opacity-80"></div>
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
          <div className="text-4xl md:hidden block cursor-pointer">
            <span className="text-white">CREATE YOUR CARD</span>
          </div>
        </motion.div>
      </div>
    </div>

  );
};

const containerVariants = {
  scatter: {},
  align: {},
};

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
