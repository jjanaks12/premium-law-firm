"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEVANAGARI_DIGITS = "०१२३४५६७८९";

function parseValue(value: string) {
  const normalized = value.replace(/[०-९]/g, (digit) =>
    String(DEVANAGARI_DIGITS.indexOf(digit)),
  );
  const match = normalized.match(/^(.*?)([\d,]+)(.*?)$/);

  if (!match) return null;

  return {
    prefix: match[1],
    target: Number(match[2].replaceAll(",", "")),
    suffix: match[3],
    devanagari: /[०-९]/.test(value),
  };
}

function formatNumber(value: number, devanagari: boolean) {
  const formatted = Math.round(value).toLocaleString("en-US");
  if (!devanagari) return formatted;

  return formatted.replace(/\d/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);
}

export default function CountUp({ value }: { value: string }) {
  const parsed = useMemo(() => parseValue(value), [value]);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => {
    if (!parsed) return value;
    return `${parsed.prefix}${formatNumber(0, parsed.devanagari)}${parsed.suffix}`;
  });

  useEffect(() => {
    if (!parsed) {
      setDisplay(value);
      return;
    }

    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const startedAt = performance.now();
        const duration = 1400;

        const animate = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = parsed.target * eased;
          setDisplay(
            `${parsed.prefix}${formatNumber(current, parsed.devanagari)}${parsed.suffix}`,
          );

          if (progress < 1) frame = requestAnimationFrame(animate);
        };

        frame = requestAnimationFrame(animate);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [parsed, value]);

  return <span ref={ref}>{display}</span>;
}
