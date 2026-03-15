import { motion } from "framer-motion";

export function CoffeeScene() {
  return (
    <div className="relative w-64 h-64 mx-auto mb-8">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full mix-blend-screen" />
      
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-2xl">
        {/* Steam */}
        <g stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 90 70 Q 100 50 90 30" className="animate-steam-1" />
          <path d="M 100 75 Q 110 55 100 35" className="animate-steam-2" />
          <path d="M 110 70 Q 120 50 110 30" className="animate-steam-3" />
        </g>

        {/* Counter */}
        <path d="M 20 160 L 180 160 L 190 180 L 10 180 Z" fill="url(#counterGrad)" />
        
        {/* Coffee Machine */}
        <rect x="70" y="80" width="60" height="80" rx="4" fill="#1e1b4b" stroke="rgba(255,255,255,0.1)" />
        <rect x="75" y="85" width="50" height="30" rx="2" fill="#2e1065" />
        <circle cx="100" cy="100" r="8" fill="#8b5cf6" />
        <path d="M 95 110 L 95 130 M 105 110 L 105 130" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
        <rect x="85" y="140" width="30" height="20" rx="2" fill="#eaddcf" />

        {/* Barista */}
        <circle cx="50" cy="90" r="15" fill="#fbcfe8" />
        <path d="M 35 120 Q 50 100 65 120 L 65 160 L 35 160 Z" fill="#7c3aed" />
        <path d="M 60 125 L 80 135" stroke="#fbcfe8" strokeWidth="6" strokeLinecap="round" />

        {/* Customer */}
        <circle cx="150" cy="100" r="14" fill="#fed7aa" />
        <path d="M 135 130 Q 150 110 165 130 L 165 160 L 135 160 Z" fill="#db2777" />

        <defs>
          <linearGradient id="counterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
