import React, { useEffect, useRef } from "react";

/**
 * MagicCanvas: Ambient interactive stardust & mystical aurora canvas
 * High performance, zero external dependencies, 60fps.
 */
export default function MagicCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== "function") return;
    if (typeof navigator !== "undefined" && navigator.userAgent?.includes("jsdom")) return;

    let ctx = null;
    try {
      ctx = canvas.getContext("2d", { alpha: true });
    } catch {
      return;
    }
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    // Mouse coordinates & interaction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
      active: false,
    };

    // Stardust particle palette
    const colors = [
      "rgba(168, 85, 247, 0.75)",  // Mystical purple
      "rgba(56, 189, 248, 0.75)",  // Astral cyan
      "rgba(244, 114, 182, 0.65)", // Ethereal pink
      "rgba(251, 191, 36, 0.7)",   // Starlight gold
      "rgba(129, 140, 248, 0.75)", // Celestial indigo
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.2 + 0.8;
        this.baseSize = this.size;
        this.speedX = (Math.random() - 0.5) * 0.45;
        this.speedY = -(Math.random() * 0.55 + 0.2); // Slowly drift upwards
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.015;
        this.alpha = Math.random() * 0.6 + 0.3;
      }

      update() {
        this.pulse += this.pulseSpeed;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.pulse) * 0.25;

        // Mouse reaction (ethereal gentle repulsion/glow)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius && mouse.active) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 3;
          this.y -= Math.sin(angle) * force * 3;
          this.size = this.baseSize * (1 + force * 1.5);
        } else {
          this.size = this.baseSize;
        }

        // Loop when floating out of view
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 5;
        ctx.globalAlpha = Math.max(0.15, Math.min(1, this.alpha + Math.sin(this.pulse) * 0.25));
        ctx.fill();
        ctx.restore();
      }
    }

    let particles = [];

    const resize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas.height = parent ? parent.clientHeight : window.innerHeight;

      // Adjust particle count: desktop ~50, mobile ~25
      const count = Math.min(70, Math.max(22, Math.floor((width * height) / 22000)));
      particles = Array.from({ length: count }, () => new Particle());
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleTouchMove = (e) => {
      if (!e.touches.length) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with subtle mystical lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 95) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = (1 - dist / 95) * 0.18;
            ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="magic-canvas"
      aria-hidden="true"
    />
  );
}
