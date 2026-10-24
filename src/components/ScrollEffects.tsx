"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content stays readable when animation is unavailable. */
export function ScrollEffects() {
  const pathname = usePathname();
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
      document.documentElement.style.setProperty("--hero-drift", `${reduced.matches ? 0 : Math.min(window.scrollY * 0.18, 150)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const animations = new Set<Animation>();
    const observed = new WeakSet<Element>();
    const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer?.unobserve(el);
        if (reduced.matches || !el.animate) continue;
        const side = el.dataset.reveal === "left" ? -28 : el.dataset.reveal === "right" ? 28 : 0;
        const animation = el.animate([
          { opacity: 0, transform: `translate3d(${side}px, ${side ? 0 : 36}px, 0) scale(.98)` },
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
        ], { duration: 850, delay: Math.min(Number(el.dataset.delay) || 0, 320), easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }) : null;

    const scan = () => document.querySelectorAll<HTMLElement>(
      "[data-reveal], .panel, .tile, .statcard, .timeline__row, .about__fact, .section__heading, .about__statement, .finale__inner, .eventcard, .welcome",
    ).forEach((el) => {
      if (observed.has(el) || el.parentElement?.closest("[data-reveal]")) return;
      observed.add(el);
      observer?.observe(el);
    });
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    const stopMotion = () => { if (reduced.matches) animations.forEach((animation) => animation.cancel()); schedule(); };
    reduced.addEventListener("change", stopMotion);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", stopMotion);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      document.documentElement.style.removeProperty("--hero-drift");
    };
  }, [pathname]);

  return <div ref={progress} className="scroll-progress" aria-hidden="true" />;
}
