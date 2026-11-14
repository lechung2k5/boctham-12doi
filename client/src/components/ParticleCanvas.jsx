import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas({ particleCount = 40, color = 'rgba(234, 179, 8, ' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 1920);
    let height = (canvas.height = canvas.parentElement.clientHeight || 1080);

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        decay: Math.random() * 0.005 + 0.002
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha -= p.decay;

        if (p.y < 0 || p.alpha <= 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.alpha = Math.random() * 0.7 + 0.3;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth || 1920;
        height = canvas.height = canvas.parentElement.clientHeight || 1080;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 gpu-accel"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

