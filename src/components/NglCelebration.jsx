import React from "react";

const PIECES = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${4 + ((index * 37) % 92)}%`,
  delay: `${(index % 8) * 0.05}s`,
  color: ["#ec4899", "#a855f7", "#38bdf8", "#facc15", "#34d399"][index % 5],
}));

export default function NglCelebration({ visible }) {
  if (!visible) return null;

  return (
    <div className="ngl-confetti" aria-hidden="true">
      {PIECES.map((piece) => (
        <span
          key={piece.id}
          style={{ left: piece.left, animationDelay: piece.delay, background: piece.color }}
        />
      ))}
    </div>
  );
}
