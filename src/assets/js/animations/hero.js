import { gsap } from "gsap";

export function initHeroAnimation() {
  const targets = document.querySelectorAll("[data-animate='hero']");

  if (!targets.length) {
    return;
  }

  gsap.from(targets, {
    y: 24,
    autoAlpha: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.08
  });
}
