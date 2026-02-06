const HEARTS = [
  { left: "5%", delay: "0s", duration: "12s", size: "0.8rem" },
  { left: "14%", delay: "2s", duration: "14s", size: "1rem" },
  { left: "23%", delay: "4s", duration: "11s", size: "0.7rem" },
  { left: "32%", delay: "1s", duration: "13s", size: "1.2rem" },
  { left: "41%", delay: "5s", duration: "15s", size: "0.9rem" },
  { left: "50%", delay: "3s", duration: "10s", size: "1.1rem" },
  { left: "59%", delay: "6s", duration: "16s", size: "0.8rem" },
  { left: "68%", delay: "2s", duration: "12s", size: "1rem" },
  { left: "77%", delay: "4s", duration: "14s", size: "0.7rem" },
  { left: "86%", delay: "0.5s", duration: "11s", size: "1.1rem" },
  { left: "94%", delay: "3.5s", duration: "13s", size: "0.9rem" },
];

export function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {HEARTS.map((heart, index) => (
        <span
          key={index}
          className="floating-heart"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            fontSize: heart.size,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
