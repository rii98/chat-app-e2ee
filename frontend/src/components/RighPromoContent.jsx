// components/E2EEImageOverlay.js
import React from "react";

const randomBits = Array.from({ length: 22 }, () => ({
  left: `${Math.random() * 95}%`,
  size: `${Math.random() * 1.2 + 0.8}em`,
  delay: `${Math.random() * 4}s`,
  duration: `${3.5 + Math.random() * 1.8}s`,
  type: Math.random() > 0.5 ? "0" : "1"
}));

const RightPromoContent = () => (
  <div
    className="hidden lg:flex items-center justify-center p-0 relative"
    style={{
      minHeight: 350,
      overflow: "hidden",
      borderRadius: "2rem",
      boxShadow: "0 4px 64px #0ea5e99f"
    }}
  >
    {/* Background Image */}
    <img
      src="https://www.ncsc.gov.uk/images/library/advanced%20cryptography%20white%20paper%2025.04.25.jpg"
      alt="E2EE Lock"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      style={{
        opacity: 0.94,
        zIndex: 1,
        filter: "brightness(1.15) contrast(1.18) blur(0.6px)",
        animation: "bgDrift 16s ease-in-out infinite alternate"
      }}
    />

    {/* Glowing aura */}
    <div
      style={{
        position: "absolute",
        left: "51%",
        top: "54%",
        transform: "translate(-50%,-50%)",
        zIndex: 2,
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          width: "22vw",
          minWidth: 180,
          maxWidth: 340,
          height: "10vw",
          minHeight: 80,
          maxHeight: 120,
          borderRadius: "55px 55px 65px 65px",
          background:
            "radial-gradient(circle at center, rgba(52,211,153,0.32) 15%, rgba(14,165,233,0.14) 70%, rgba(59,130,246,0.03) 100%)",
          filter: "blur(16px)",
          animation: "auraPulse 6s ease-in-out infinite"
        }}
      />
    </div>

    {/* Floating animated 0s and 1s */}
    {randomBits.map((bit, i) => (
      <span
        key={i}
        className="absolute font-mono pointer-events-none select-none"
        style={{
          left: bit.left,
          top: "-2em",
          fontSize: bit.size,
          color: "#14b8a6",
          textShadow: "0 0 18px #22d3ee, 0 0 2px #fff",
          zIndex: 3,
          fontWeight: 700,
          letterSpacing: "1.8px",
          animation: `floatBit ${bit.duration} linear infinite`,
          animationDelay: bit.delay,
          opacity: 0.9
        }}
      >
        {bit.type}
      </span>
    ))}

    {/* Headline and glass text */}
    <div
      className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-6 flex flex-col items-center z-10"
      style={{ alignItems: "center", textAlign: "center" }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          color: "#f3f4f6",
          textShadow:
            "0 2px 30px #14b8a6, 0 0px 12px #0ea5e9, 0 0 38px #38bdf8",
          fontWeight: 800,
          letterSpacing: ".5px",
          marginBottom: "0.3em",
          animation: "floatGlow 3.2s ease-in-out infinite, colorShift 5s linear infinite"
        }}
      >
        End-to-End Encrypted
      </h2>

      <div
        style={{
          background: "rgba(18,22,37,.63)",
          borderRadius: "16px",
          padding: "1.05rem 2.2rem",
          boxShadow: "0 6px 36px #0ea5e9bb",
          backdropFilter: "blur(9px)",
          color: "#bae6fd",
          fontSize: "1.2rem",
          fontWeight: 500,
          textAlign: "center",
          border: "1.5px solid rgba(59,130,246,0.14)",
          animation: "floatGlowSub 3.2s ease-in-out infinite"
        }}
      >
        Your messages are{" "}
        <span style={{ color: "#14b8a6", fontWeight: 700 }}>private</span> and
        <span style={{ color: "#38bdf8", fontWeight: 700 }}> secure</span>
        <br />
        — protected by{" "}
        <span
          style={{
            color: "#fff",
            background: "linear-gradient(90deg,#14b8a6,#0ea5e9,#38bdf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            letterSpacing: "1px"
          }}
        >
          E2EE encryption
        </span>.
      </div>
    </div>

    {/* Keyframe animations */}
    <style>{`
      @keyframes floatBit {
        0% { transform: translateY(0) translateX(0) scale(1) rotate(-8deg); opacity: 0.8; }
        25% { transform: translateY(100px) translateX(5px) scale(1.05) rotate(6deg); opacity: 0.95; }
        50% { transform: translateY(200px) translateX(-5px) scale(1.08) rotate(-4deg); opacity: 0.85; }
        75% { transform: translateY(300px) translateX(8px) scale(1.1) rotate(8deg); opacity: 0.6; }
        100% { transform: translateY(400px) translateX(-8px) scale(1.12) rotate(10deg); opacity: 0.05; }
      }

      @keyframes floatGlow {
        0%, 100% { transform: translateY(0); text-shadow: 0 0 24px #38bdf8, 0 0 12px #14b8a6; }
        40% { transform: translateY(-10px); text-shadow: 0 0 42px #0ea5e9, 0 0 28px #38bdf8; }
        60% { transform: translateY(8px); text-shadow: 0 0 28px #14b8a6, 0 0 14px #38bdf8; }
      }

      @keyframes floatGlowSub {
        0%, 100% { transform: translateY(0); box-shadow: 0 6px 36px #0ea5e9bb; }
        40% { transform: translateY(-8px); box-shadow: 0 10px 54px #38bdf8cc; }
        60% { transform: translateY(5px); box-shadow: 0 6px 30px #14b8a6aa; }
      }

      @keyframes auraPulse {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
        50% { transform: scale(1.08) rotate(4deg); opacity: 1; }
      }

      @keyframes bgDrift {
        0% { transform: scale(1.05) translate(0,0); }
        100% { transform: scale(1.1) translate(-12px, 8px); }
      }

      @keyframes colorShift {
        0% { color: #f3f4f6; }
        25% { color: #dbeafe; }
        50% { color: #e0f2fe; }
        75% { color: #f3f4f6; }
        100% { color: #f3f4f6; }
      }
    `}</style>
  </div>

);

export default RightPromoContent;
