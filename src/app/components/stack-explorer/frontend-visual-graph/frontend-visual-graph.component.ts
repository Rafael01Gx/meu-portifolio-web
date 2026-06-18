import { Component, Input, ViewChild, ElementRef, afterNextRender, inject, DestroyRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { Skill } from '../../../models/skill.model';
import gsap from 'gsap';

@Component({
  selector: 'app-frontend-visual-graph',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="w-full h-[80vh] min-h-[650px] relative overflow-hidden flex items-center justify-center">
      
      <!-- Radar Background -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0">
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--accent-backend)" stop-opacity="0.1" />
            <stop offset="100%" stop-color="transparent" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="45%" fill="url(#radar-glow)" />
        <circle cx="50%" cy="50%" r="15%" fill="none" stroke="var(--accent-backend)" stroke-width="1" stroke-dasharray="4 4" opacity="0.3" />
        <circle cx="50%" cy="50%" r="30%" fill="none" stroke="var(--accent-backend)" stroke-width="1" stroke-dasharray="4 4" opacity="0.3" />
        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="var(--accent-backend)" stroke-width="1" stroke-dasharray="4 4" opacity="0.3" />
        
        <!-- Radar Crosshairs -->
        <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="var(--accent-backend)" stroke-width="1" opacity="0.2" />
        <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="var(--accent-backend)" stroke-width="1" opacity="0.2" />
      </svg>

      <!-- Radar Sweeper -->
      <div #sweeper class="absolute top-1/2 left-1/2 w-[45%] h-[2px] bg-gradient-to-r from-transparent to-[var(--accent-backend)] origin-left z-0 pointer-events-none shadow-[0_0_15px_rgba(109,179,63,1)]"></div>

      <!-- Center Logo / Hub -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[var(--accent-backend)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(109,179,63,0.5)] z-10">
        <ng-icon name="lucideDatabase" size="32" class="text-[var(--accent-backend)] opacity-90"></ng-icon>
        <div class="absolute inset-0 rounded-full border border-[var(--accent-backend)] animate-ping opacity-50"></div>
      </div>

      <!-- Skill Nodes Container -->
      <div #graphContainer class="absolute inset-0 w-full h-full z-20">
        @for (skill of skills; track skill.name; let i = $index) {
          <div class="skill-node absolute cursor-pointer group hover:z-[60]" 
               [style.left]="nodePositions[i]?.x + '%'" 
               [style.top]="nodePositions[i]?.y + '%'"
               [style.transform]="'translate(-50%, -50%)'">
            
            <div class="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-line)] flex items-center justify-center transition-all duration-300 hover:border-[var(--accent-backend)] hover:shadow-[0_0_20px_rgba(109,179,63,0.6)] hover:scale-125 z-10 shadow-xl"
                 [ngClass]="{
                   'text-[#DD0031]': skill.category === 'frontend',
                   'text-[#6DB33F]': skill.category === 'backend-core',
                   'text-[#4169E1]': skill.category === 'data',
                   'text-[#FF6600]': skill.category === 'devops',
                   'text-[var(--text-primary)]': skill.category === 'testes'
                 }">
              <ng-icon [name]="skill.icon" size="28" class="transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_currentColor]"></ng-icon>
            </div>

            <!-- Tooltip -->
            <div class="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-[#0b0c10] border border-[var(--accent-backend)] rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-[0_0_15px_rgba(109,179,63,0.3)]">
              <p class="font-bold text-[var(--text-primary)] mb-1 text-center">{{ skill.name }}</p>
              <p class="text-[10px] font-mono text-[var(--accent-backend)] uppercase tracking-widest text-center">{{ skill.category }}</p>
              <div class="w-full bg-[#1e2025] h-1.5 mt-2 rounded-full overflow-hidden">
                <div class="h-full bg-[var(--accent-backend)]" 
                     [style.width]="skill.proficiency === 'core' ? '100%' : skill.proficiency === 'proficient' ? '70%' : '40%'">
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class FrontendVisualGraphComponent implements OnChanges {
  @Input() skills: Skill[] = [];
  @Input() isVisible: boolean = false;
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @ViewChild('sweeper') sweeper!: ElementRef;
  
  nodePositions: {x: number, y: number}[] = [];
  private hasAnimated = false;
  
  private destroyRef = inject(DestroyRef);

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['skills']) {
      this.calculatePositions();
    }
    
    if (changes['isVisible'] && this.isVisible && !this.hasAnimated) {
      this.hasAnimated = true;
      setTimeout(() => {
        this.initAnimations();
      }, 100);
    }
  }

  private calculatePositions() {
    this.nodePositions = this.skills.map((skill, index) => {
      const total = this.skills.length;
      if (total === 0) return { x: 50, y: 50 };

      let ringRadius = 40;
      if (skill.category === 'backend-core' || skill.category === 'frontend') {
        ringRadius = 15 + Math.random() * 10;
      } else {
        ringRadius = 30 + Math.random() * 10;
      }

      const angle = (index / total) * Math.PI * 2;
      const radiusX = ringRadius;
      const radiusY = ringRadius;

      return {
        x: 50 + Math.cos(angle) * radiusX,
        y: 50 + Math.sin(angle) * radiusY
      };
    });
  }

  initAnimations() {
    const ctx = gsap.context(() => {
      // Sweeper Animation
      if (this.sweeper) {
        gsap.to(this.sweeper.nativeElement, {
          rotation: 360,
          duration: 4,
          repeat: -1,
          ease: "none",
          transformOrigin: "left center"
        });
      }

      // Nodes entrance and float
      if (this.graphContainer) {
        const nodes = this.graphContainer.nativeElement.querySelectorAll('.skill-node');
        
        nodes.forEach((node: any, i: number) => {
          gsap.from(node, {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.5)",
            delay: i * 0.05
          });

          // Small subtle pulsing for nodes
          gsap.to(node, {
            y: "+=5",
            duration: "random(1.5, 3)",
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: "random(0, 1)"
          });
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      ctx.revert();
    });
  }
}
