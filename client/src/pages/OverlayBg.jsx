import React, { useEffect, useRef } from 'react';
import ParticleCanvas from '../components/ParticleCanvas';
import gsap from 'gsap';

export default function OverlayBg() {
  const containerRef = useRef(null);
  const trophyRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    // Subtle float / breathing animation on decorative elements
    if (trophyRef.current) {
      gsap.to(trophyRef.current, {
        y: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    if (bannerRef.current) {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent flex items-center justify-center select-none">
      {/* 1920x1080 Fixed Canvas Viewport (OBS Browser Source) */}
      <div
        ref={containerRef}
        className="relative w-[1920px] h-[1080px] overflow-hidden bg-transparent gpu-accel"
        style={{
          transformOrigin: 'center center',
          width: '1920px',
          height: '1080px'
        }}
      >
        {/* Ambient Floating Fire/Sparks Particles */}
        <ParticleCanvas particleCount={45} color="rgba(250, 204, 21, " />

        {/* The Master SVG Layer */}
        <img
          src="/assets/khung-tong/asset_full.svg"
          alt="Overlay Background Tổng"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
        />

        {/* Dynamic Light Shimmer Sweep across Tournament Banner (x: 311, y: 20, w: 901, h: 170) */}
        <div
          ref={bannerRef}
          className="absolute pointer-events-none overflow-hidden z-10"
          style={{
            left: '311px',
            top: '20px',
            width: '901px',
            height: '170px'
          }}
        >
          <div className="shimmer-badge w-full h-full" />
        </div>

        {/* Decorative Floating Glow Aura over Trophy/Mascot Area (x: 1498, y: 365, w: 341, h: 312) */}
        <div
          ref={trophyRef}
          className="absolute pointer-events-none rounded-full bg-amber-400/15 blur-3xl z-10 gpu-accel"
          style={{
            left: '1480px',
            top: '350px',
            width: '380px',
            height: '350px'
          }}
        />
      </div>
    </div>
  );
}

