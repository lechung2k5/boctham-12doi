import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

export default function DrawModalCinematic({ activeDraw, onAnimationComplete }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const auraRef = useRef(null);

  useEffect(() => {
    if (!activeDraw || !activeDraw.team) return;

    const { team, status, target } = activeDraw;

    // Timeline for Entrance / Reveal
    if (status === 'picked') {
      const tl = gsap.timeline();

      // Reset initial styles
      gsap.set(cardRef.current, {
        scale: 0.2,
        opacity: 0,
        rotationY: -180,
        x: 0,
        y: 0
      });

      tl.to(cardRef.current, {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        duration: 0.9,
        ease: 'back.out(1.7)'
      });

      // Infinite pulsating glow while picked
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.25,
          opacity: 0.8,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }

    // Sequence for Assignment to Slot
    if (status === 'assigned' && target) {
      const targetElement = document.getElementById(`slot-${target.group}-${target.slotIndex}`);
      if (targetElement && cardRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const cardRect = cardRef.current.getBoundingClientRect();

        const deltaX = targetRect.left + targetRect.width / 2 - (cardRect.left + cardRect.width / 2);
        const deltaY = targetRect.top + targetRect.height / 2 - (cardRect.top + cardRect.height / 2);

        const tl = gsap.timeline({
          onComplete: () => {
            // Burst victory confetti at target location
            confetti({
              particleCount: 35,
              spread: 60,
              origin: {
                x: (targetRect.left + targetRect.width / 2) / window.innerWidth,
                y: (targetRect.top + targetRect.height / 2) / window.innerHeight
              },
              colors: ['#facc15', '#f59e0b', '#ffffff']
            });

            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }
        });

        // Flash & Fly to target slot
        tl.to(cardRef.current, {
          scale: 1.1,
          duration: 0.2,
          ease: 'power2.out'
        })
          .to(cardRef.current, {
            x: deltaX,
            y: deltaY,
            scale: 0.35,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.inOut'
          });
      }
    }
  }, [activeDraw, onAnimationComplete]);

  if (!activeDraw || !activeDraw.team) return null;

  const { team, status, target } = activeDraw;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Darkened backdrop with blur when picked */}
      {status === 'picked' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" />
      )}

      {/* Main 3D Card */}
      <div
        ref={cardRef}
        className="relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-400/80 shadow-[0_0_50px_rgba(250,204,21,0.5)] gpu-accel min-w-[380px]"
        style={{ perspective: 1000 }}
      >
        {/* Pulsating Aura Halo */}
        <div
          ref={glowRef}
          className="absolute -inset-4 rounded-3xl bg-amber-500/20 blur-xl pointer-events-none"
        />

        {/* Header Tag */}
        <div className="mb-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-display font-black text-xs uppercase tracking-widest shadow-md">
          {status === 'assigned' && target
            ? `VÀO BẢNG ${target.group} - VỊ TRÍ ${target.slotIndex + 1}`
            : 'ĐỘI BÓNG ĐƯỢC BỐC'}
        </div>

        {/* Team Logo Circular Spotlight */}
        <div className="relative w-36 h-36 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-2xl mb-4">
          <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img
              src={team.logo}
              alt={team.code}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          {/* Subtle rotating ring */}
          <div className="absolute -inset-1 rounded-full border border-amber-400/50 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Team Code & Full Name */}
        <h2 className="font-display font-black text-4xl text-amber-300 tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {team.code}
        </h2>
        <p className="mt-1 text-slate-200 font-semibold text-base text-center max-w-[320px]">
          {team.name}
        </p>

        {/* Bottom Status bar */}
        <div className="mt-5 flex items-center space-x-2 text-xs font-bold text-amber-400/90 tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{status === 'assigned' ? 'ĐANG KHÓA VỊ TRÍ...' : 'CHỜ XẾP BẢNG ĐẤU'}</span>
        </div>
      </div>
    </div>
  );
}

