import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SlotItem({ group, slotIndex, team, isNewlyAssigned }) {
  const slotRef = useRef(null);
  const slotLabel = `${group}${slotIndex + 1}`;

  useEffect(() => {
    if (isNewlyAssigned && slotRef.current) {
      // Trigger GSAP flash & punch scale on newly assigned team
      gsap.fromTo(
        slotRef.current,
        { scale: 1.15, filter: 'brightness(2) drop-shadow(0 0 20px #facc15)' },
        {
          scale: 1,
          filter: 'brightness(1) drop-shadow(0 0 0px #000)',
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        }
      );
    }
  }, [isNewlyAssigned, team]);

  return (
    <div
      ref={slotRef}
      id={`slot-${group}-${slotIndex}`}
      className={`relative flex items-center px-3 py-1 rounded-md transition-all duration-300 gpu-accel h-[41px] ${
        team
          ? 'bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-amber-400/60 shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
          : 'bg-black/40 border border-dashed border-slate-700/60'
      }`}
    >
      {/* Slot Label Badge (A1, A2...) */}
      <div
        className={`w-9 h-7 flex items-center justify-center font-display font-black text-xs rounded tracking-wider shadow-inner ${
          team
            ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-black'
            : 'bg-slate-800/80 text-slate-400 border border-slate-700'
        }`}
      >
        {slotLabel}
      </div>

      {team ? (
        <>
          {/* Team Logo */}
          <div className="ml-3 relative w-7 h-7 flex-shrink-0 rounded-full overflow-hidden border border-amber-300/80 shadow-md bg-white">
            <img
              src={team.logo}
              alt={team.code}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Team Code & Name */}
          <div className="ml-3 flex items-baseline space-x-2 overflow-hidden">
            <span className="font-display font-black text-amber-300 text-base tracking-wide uppercase drop-shadow-sm">
              {team.code}
            </span>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[280px]">
              {team.name}
            </span>
          </div>

          {/* Golden right accent bar */}
          <div className="ml-auto w-1 h-4 bg-amber-400/80 rounded-full" />
        </>
      ) : (
        <div className="ml-3 flex items-center space-x-2 text-slate-500 text-xs font-medium italic">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
          <span>Chờ bốc thăm...</span>
        </div>
      )}
    </div>
  );
}

