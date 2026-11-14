import React, { useState, useEffect } from 'react';
import { useDrawSocket } from '../hooks/useDrawSocket';
import GroupTable from '../components/GroupTable';
import DrawModalCinematic from '../components/DrawModalCinematic';
import ParticleCanvas from '../components/ParticleCanvas';

export default function OverlayDraw() {
  const { state, lastEvent, clearActiveDraw } = useDrawSocket();
  const [newlyAssigned, setNewlyAssigned] = useState(null);

  const { groups = { A: [null, null, null, null], B: [null, null, null, null], C: [null, null, null, null] }, activeDraw } = state;

  useEffect(() => {
    if (lastEvent && lastEvent.type === 'SLOT_ASSIGNED') {
      const { group, slotIndex } = lastEvent.data;
      setNewlyAssigned({ group, slotIndex });

      const timer = setTimeout(() => {
        setNewlyAssigned(null);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent flex items-center justify-center select-none">
      {/* Fixed Full HD 1920x1080 Viewport for OBS / vMix Browser Source */}
      <div
        id="broadcast-canvas"
        className="relative w-[1920px] h-[1080px] overflow-hidden bg-transparent gpu-accel"
        style={{
          width: '1920px',
          height: '1080px'
        }}
      >
        {/* Floating Atmospheric Sport Sparks */}
        <ParticleCanvas particleCount={40} color="rgba(250, 204, 21, " />

        {/* Master SVG Asset Background Layer (viewBox: 0 0 1920 1081) */}
        <img
          src="/assets/khung-boc-tham/full-asset.svg"
          alt="Khung Bốc Thăm Giải Đấu"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
        />

        {/* Shimmer light sweep on Header Banner (x: 212, y: 20, w: 901, h: 170) */}
        <div
          className="absolute pointer-events-none overflow-hidden z-10"
          style={{
            left: '212px',
            top: '20px',
            width: '901px',
            height: '170px'
          }}
        >
          <div className="shimmer-badge w-full h-full" />
        </div>

        {/* Table A Slots Container (x: 1271, y: 233, w: 563, h: 186) */}
        <GroupTable
          group="A"
          slots={groups.A || [null, null, null, null]}
          newlyAssignedSlot={newlyAssigned?.group === 'A' ? newlyAssigned.slotIndex : null}
          x={1271}
          y={233}
          w={563}
          h={186}
        />

        {/* Table B Slots Container (x: 1271, y: 508, w: 563, h: 186) */}
        <GroupTable
          group="B"
          slots={groups.B || [null, null, null, null]}
          newlyAssignedSlot={newlyAssigned?.group === 'B' ? newlyAssigned.slotIndex : null}
          x={1271}
          y={508}
          w={563}
          h={186}
        />

        {/* Table C Slots Container (x: 1271, y: 776, w: 563, h: 186) */}
        <GroupTable
          group="C"
          slots={groups.C || [null, null, null, null]}
          newlyAssignedSlot={newlyAssigned?.group === 'C' ? newlyAssigned.slotIndex : null}
          x={1271}
          y={776}
          w={563}
          h={186}
        />

        {/* Cinematic Spotlight & Flight Animation for Picked / Assigned Team */}
        <DrawModalCinematic
          activeDraw={activeDraw}
          onAnimationComplete={() => {
            // Clear active modal after flight animation finishes
            setTimeout(() => {
              clearActiveDraw();
            }, 800);
          }}
        />
      </div>
    </div>
  );
}

