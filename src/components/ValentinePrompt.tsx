"use client";

import { useMemo, useRef, useState } from "react";

const CELEBRATION_HEARTS = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 11) % 100}%`,
  delay: `${(index % 6) * 0.15}s`,
  duration: `${2.4 + (index % 4) * 0.3}s`,
}));

const NO_BUTTON_BASE_TOP = 52;

export function ValentinePrompt({ partnerName }: { partnerName: string }) {
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [isNoButtonChaotic, setIsNoButtonChaotic] = useState(false);

  const message = useMemo(
    () =>
      accepted
        ? `Best decision ever. I cannot wait for this Valentine's Day with you, ${partnerName}.`
        : "Tap yes when your heart is ready.",
    [accepted, partnerName],
  );

  const moveNoButton = () => {
    if (!actionsRef.current || !noButtonRef.current || accepted) {
      return;
    }

    if (
      window.matchMedia("(max-width: 640px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const actions = actionsRef.current.getBoundingClientRect();
    const button = noButtonRef.current.getBoundingClientRect();

    const maxX = Math.max(actions.width - button.width - 12, 0);
    const maxY = Math.max(actions.height - button.height - NO_BUTTON_BASE_TOP - 12, 0);

    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    setNoButtonPosition({ x, y });
    setIsNoButtonChaotic(true);
  };

  return (
    <div className="proposal-box">
      <h3>Will you be my Valentine?</h3>
      <p>{message}</p>

      <div className="proposal-actions" ref={actionsRef}>
        <button
          type="button"
          onClick={() => setAccepted(true)}
          className="yes-btn"
        >
          Yes, obviously ♥
        </button>
        <button
          type="button"
          ref={noButtonRef}
          onMouseEnter={moveNoButton}
          onClick={moveNoButton}
          className={`no-btn ${isNoButtonChaotic ? "floating" : ""}`}
          style={{
            transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
          }}
        >
          No
        </button>
      </div>

      {accepted ? (
        <div className="proposal-celebration" aria-hidden="true">
          {CELEBRATION_HEARTS.map((heart, index) => (
            <span
              key={index}
              className="burst-heart"
              style={{
                left: heart.left,
                animationDelay: heart.delay,
                animationDuration: heart.duration,
              }}
            >
              ♥
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
