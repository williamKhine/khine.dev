"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Adapted from https://reactbits.dev/animations/fade-content. See react-bits-LICENSE.md.
export function FadeContent({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!element || !motion.matches || !("IntersectionObserver" in window)) return;

    let animation: Animation | undefined;
    const stopAnimation = () => animation?.cancel();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      observer.disconnect();
      if (motion.matches) {
        animation = element.animate([{ opacity: 0.65 }, { opacity: 1 }], {
          duration: 380,
          easing: "ease-out",
        });
      }
    });

    observer.observe(element);
    motion.addEventListener("change", stopAnimation);
    return () => {
      observer.disconnect();
      stopAnimation();
      motion.removeEventListener("change", stopAnimation);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
