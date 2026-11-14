import React, { useEffect, useRef } from 'react';
import SlotItem from './SlotItem';
import gsap from 'gsap';

export default function GroupTable({ group, slots, newlyAssignedSlot, x, y, w = 563, h = 186 }) {
  const tableRef = useRef(null);

  useEffect(() => {
    // Stagger entrance on initial mount
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: group === 'A' ? 0.2 : group === 'B' ? 0.4 : 0.6,
          ease: 'power3.out'
        }
      );
    }
  }, [group]);

  return (
    <div
      ref={tableRef}
      id={`table-group-${group}`}
      className="absolute flex flex-col justify-between p-1.5 gpu-accel"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`
      }}
    >
      {slots.map((team, idx) => (
        <SlotItem
          key={idx}
          group={group}
          slotIndex={idx}
          team={team}
          isNewlyAssigned={newlyAssignedSlot === idx}
        />
      ))}
    </div>
  );
}

