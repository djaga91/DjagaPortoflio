import React from "react";

export const Confetti: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="confetti"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          backgroundColor: ["#f97316", "#7c3aed", "#fbbf24", "#10b981"][
            Math.floor(Math.random() * 4)
          ],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${1 + Math.random() * 2}s`,
        }}
      />
    ))}
  </div>
);
