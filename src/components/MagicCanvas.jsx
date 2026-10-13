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
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let ctx = null;
    try {
      ctx = canvas.getContext("2d", { alpha: true });
    } catch {
      return;
    }
    if (!ctx) return;

    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let isInViewport = typeof IntersectionObserver === "undefined";
    let isDocumentVisible = !document.hidden;

    // Mouse coordinates & interaction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 100,
      active: false,
    };

    // Stardust particle palette
    const colors = [
      "rgba(79, 70, 229, 0.4)",
      "rgba(8, 145, 178, 0.34)",
      "rgba(99, 102, 241, 0.3)",
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 1.4 + 0.5;
        this.baseSize = this.size;
        this.speedX = (Math.random() - 0.5) * 0.22;
        this.speedY = -(Math.random() * 0.24 + 0.08);
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.015;
        this.alpha = Math.random() * 0.28 + 0.12;
      }

      update() {
        this.pulse += this.pulseSpeed;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.pulse) * 0.25;

        // Mouse reaction (ethereal gentle repulsion/glow)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < mouse.radius * mouse.radius && mouse.active) {
          const dist = Math.sqrt(distanceSquared);
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
          this.size = this.baseSize * (1 + force * 0.65);
        } else {
          this.size = this.baseSize;
        }

        // Loop when floating out of view
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
        }
      }

      draw() {
        const particleAlpha = Math.max(
          0.15,
          Math.min(1, this.alpha + Math.sin(this.pulse) * 0.25),
        );

        // A cheap two-layer halo avoids Canvas 2D's costly shadowBlur filter.
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = particleAlpha * 0.2;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.globalAlpha = particleAlpha;
        ctx.fill();
      }
    }

    let particles = [];

    const resize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas.height = parent ? parent.clientHeight : window.innerHeight;

      const count = width < 768 ? 6 : 12;
      particles = Array.from({ length: count }, () => new Particle());
    };

    const handleMouseMove = (e) => {
      if (!isInViewport || !isDocumentVisible) return;
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
      if (!isInViewport || !isDocumentVisible || !e.touches.length) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw every connection in one path/state change instead of save/restore
      // calls inside the O(N²) loop.
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared < 9025) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.globalAlpha = 0.045;
      ctx.strokeStyle = "rgb(79, 70, 229)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (animationFrameId === null) return;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    };

    const syncAnimation = () => {
      if (isInViewport && isDocumentVisible) {
        if (animationFrameId === null) animationFrameId = requestAnimationFrame(animate);
      } else {
        stopAnimation();
      }
    };

    const visibilityObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              isInViewport = entry.isIntersecting;
              syncAnimation();
            },
            { threshold: 0.01 },
          );

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      syncAnimation();
    };

    resize();
    if (visibilityObserver) visibilityObserver.observe(canvas);
    else syncAnimation();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopAnimation();
      visibilityObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
