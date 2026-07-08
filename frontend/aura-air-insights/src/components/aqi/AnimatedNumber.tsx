import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const startVal = from.current;
    const delta = value - startVal;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(startVal + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toFixed(decimals)}</>;
}