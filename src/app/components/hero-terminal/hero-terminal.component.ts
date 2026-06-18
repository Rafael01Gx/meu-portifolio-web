import { Component, ElementRef, ViewChild, ViewChildren, QueryList, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { PROFILE } from '../../data/profile.data';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-hero-terminal',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 md:px-12 pt-24 pb-12">
      <!-- Ambient Grid Background -->
      <div class="absolute inset-0 pointer-events-none grid-bg opacity-30"></div>
      
      <!-- Bottom Fade Overlay to blend into Stack Explorer -->
      <div class="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[var(--bg-base)] to-transparent z-10 pointer-events-none"></div>
      
      <!-- Glow Orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-backend)] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-frontend)] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>

      <div class="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        <!-- Left Content -->
        <div class="flex flex-col items-start gap-6">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-line)] shadow-sm">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-xs font-mono text-[var(--text-muted)] tracking-wider">STATUS: ONLINE</span>
          </div>

          <h1 class="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)] tracking-tight leading-tight">
            {{ profile.name }}
          </h1>

          <div class="space-y-4">
            <h2 class="text-xl md:text-2xl font-mono text-[var(--accent-backend)]">
              > {{ profile.role }}
            </h2>
            <p class="text-lg text-[var(--text-muted)] max-w-lg leading-relaxed">
              Especialista em ecossistema Java, focado em alta performance, APIs RESTful e arquitetura escalável.
            </p>
          </div>

          <button #ctaBtn 
                  (click)="scrollToStack()"
                  class="mt-4 px-8 py-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-line)] text-[var(--text-primary)] font-display font-bold tracking-wide hover:border-[var(--accent-frontend)] hover:text-[var(--accent-frontend)] transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(138,99,244,0.3)] flex items-center gap-3">
            Explorar Stack
            <ng-icon name="lucideChevronDown" size="20"></ng-icon>
          </button>
        </div>

        <!-- Right Floating Tech Elements -->
        <div class="relative h-[400px] hidden lg:flex items-center justify-center perspective-1000">
          <div class="relative w-full h-full flex items-center justify-center transform-style-3d">
            
            <!-- Central Avatar or Core Logo -->
            <div #floatingCard class="absolute z-20 w-32 h-32 rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)] border border-[var(--accent-backend)] flex items-center justify-center shadow-[0_0_30px_rgba(245,166,35,0.2)]">
              <ng-icon name="lucideCoffee" size="64" class="text-[var(--accent-backend)]"></ng-icon>
            </div>

            <!-- Orbiting Cards -->
            <div #floatingCard class="absolute z-10 -top-4 right-10 w-20 h-20 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-line)] flex items-center justify-center shadow-xl">
              <ng-icon name="simpleSpringboot" size="36" class="text-[#6DB33F]"></ng-icon>
            </div>

            <div #floatingCard class="absolute z-30 bottom-10 right-20 w-24 h-24 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-line)] flex items-center justify-center shadow-xl">
              <ng-icon name="simpleDocker" size="44" class="text-[#2496ED]"></ng-icon>
            </div>

            <div #floatingCard class="absolute z-10 top-1/4 left-0 w-16 h-16 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-line)] flex items-center justify-center shadow-xl">
              <ng-icon name="simpleAngular" size="32" class="text-[#DD0031]"></ng-icon>
            </div>

            <div #floatingCard class="absolute z-20 -bottom-8 left-10 w-20 h-20 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-line)] flex items-center justify-center shadow-xl">
              <ng-icon name="simplePostgresql" size="36" class="text-[#4169E1]"></ng-icon>
            </div>

          </div>
        </div>

      </div>
    </section>
  `,
  styles: [
    `
    .grid-bg {
      background-size: 40px 40px;
      background-image: 
        linear-gradient(to right, var(--border-line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--border-line) 1px, transparent 1px);
      mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
      -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
    }
    .perspective-1000 {
      perspective: 1000px;
    }
    .transform-style-3d {
      transform-style: preserve-3d;
    }
    `
  ]
})
export class HeroTerminalComponent {
  profile = PROFILE;
  
  @ViewChild('ctaBtn') ctaBtn!: ElementRef<HTMLButtonElement>;
  @ViewChildren('floatingCard') floatingCards!: QueryList<ElementRef<HTMLDivElement>>;
  
  private animationService = inject(AnimationService);

  constructor() {
    afterNextRender(() => {
      // Apply floating effect to tech cards
      if (this.floatingCards.length > 0) {
        const elements = this.floatingCards.map(c => c.nativeElement);
        this.animationService.floatingEffect(elements);
      }

      // Apply magnetic effect to CTA
      if (this.ctaBtn) {
        this.animationService.magneticHover(this.ctaBtn.nativeElement, 30);
      }
    });
  }

  scrollToStack() {
    document.getElementById('stack')?.scrollIntoView({ behavior: 'smooth' });
  }
}
