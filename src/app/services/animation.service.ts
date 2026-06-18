import { Injectable, DestroyRef, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private destroyRef = inject(DestroyRef);

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  typewriterEffect(element: HTMLElement, lines: string[], onComplete?: () => void) {
    // Clear element
    element.innerHTML = '';
    
    // Create elements for each line
    const lineElements = lines.map(line => {
      const div = document.createElement('div');
      
      // If it's the module line, wrap the progress bars in spans for color
      if (line.startsWith('MÓDULOS:')) {
        div.innerHTML = line
          .replace('BACKEND', '<span class="text-[var(--accent-backend)]">BACKEND</span>')
          .replace('████████░░', '<span class="text-[var(--accent-backend)]">████████░░</span>')
          .replace('FRONTEND', '<span class="text-[var(--accent-frontend)]">FRONTEND</span>')
          .replace('████░░░░░░', '<span class="text-[var(--accent-frontend)]">████░░░░░░</span>');
      } else {
        div.textContent = line;
      }
      
      div.style.opacity = '0'; // hide initially
      element.appendChild(div);
      return div;
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      lineElements.forEach(el => el.style.opacity = '1');
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: onComplete
    });

    lineElements.forEach((el, index) => {
      // simple sequential fade-in per line is more performant and still feels like a CLI boot
      tl.to(el, { opacity: 1, duration: 0.2, ease: "power1.inOut" }, index === 0 ? "+=0" : "+=0.3");
    });

    this.destroyRef.onDestroy(() => {
      tl.kill();
    });
  }

  revealOnScroll(element: HTMLElement | HTMLElement[]) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element as Element,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: Array.isArray(element) ? 0.1 : 0
      });
    });

    this.destroyRef.onDestroy(() => {
      ctx.revert();
    });
  }

  floatingEffect(elements: HTMLElement[]) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      elements.forEach((el, i) => {
        gsap.to(el, {
          y: "random(-15, 15)",
          x: "random(-10, 10)",
          rotation: "random(-5, 5)",
          duration: "random(3, 6)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.2
        });
      });
    });

    this.destroyRef.onDestroy(() => {
      ctx.revert();
    });
  }

  magneticHover(element: HTMLElement, intensity: number = 20) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        
        const x = ((relX / rect.width) - 0.5) * intensity;
        const y = ((relY / rect.height) - 0.5) * intensity;
        
        gsap.to(element, {
          x: x,
          y: y,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });

    this.destroyRef.onDestroy(() => {
      ctx.revert();
    });
  }
}


