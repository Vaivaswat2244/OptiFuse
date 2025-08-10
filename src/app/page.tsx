'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function LandingPage() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
        color: #fff;
        overflow: hidden;
        position: relative;
      }
      .flame-container {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: 0;
      }
      .flame {
        position: absolute;
        bottom: -50px;
        width: 100px;
        height: 150px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        animation: rise 15s infinite ease-in-out, sway 3s infinite alternate, flicker 0.5s infinite alternate;
        opacity: 0;
      }
      .flame-top {
        top: -50px;
        bottom: auto;
        animation-name: fall, sway, flicker;
        transform-origin: bottom;
      }
      ${[...Array(10)].map((_, i) => `
        .flame:nth-child(${i + 1}) {
          left: ${10 * i}%;
          animation-delay: ${i + 1}s, ${0.1 * i}s, ${0.1 * i}s;
          animation-duration: ${15 + i}s, ${3 + (i % 2)}s, ${0.5 + (i % 3) * 0.1}s;
        }
        .flame-top:nth-child(${i + 11}) {
          left: ${10 * i}%;
          animation-delay: ${i + 1.5}s, ${0.15 * i}s, ${0.1 * i}s;
          animation-duration: ${15.5 + i}s, ${3 + (i % 2)}s, ${0.5 + (i % 3) * 0.1}s;
        }
      `).join('')}
      @keyframes rise {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.1; }
        100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
      }
      @keyframes fall {
        0% { transform: translateY(0) scale(0.5) rotate(180deg); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.1; }
        100% { transform: translateY(100vh) scale(1.5) rotate(180deg); opacity: 0; }
      }
      @keyframes sway {
        0% { transform: translateX(0px) rotate(0deg); }
        100% { transform: translateX(20px) rotate(-5deg); }
      }
      @keyframes flicker {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.05); opacity: 0.4; }
        100% { transform: scale(1); opacity: 0.3; }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
        50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.7); }
      }
      .pulsating-glow {
        animation: pulse-glow 3s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flame-container">
        {[...Array(10)].map((_, i) => (
          <div key={`f${i}`} className="flame"></div>
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={`ft${i}`} className="flame flame-top"></div>
        ))}
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl text-white">
          Welcome to Optifuse
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Optimize Your Workflow Today
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Link href="/login">
          <Button className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-3 px-8 rounded-lg text-lg transition-colors pulsating-glow" size="lg">
            Get Started
          </Button>
        </Link>
        <p className="text-sm text-gray-400"></p>
      </div>
    </main>
  );
}
