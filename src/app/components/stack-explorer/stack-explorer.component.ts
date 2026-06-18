import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackModeToggleComponent } from './stack-mode-toggle/stack-mode-toggle.component';
import { BackendTerminalComponent } from './backend-terminal/backend-terminal.component';
import { FrontendVisualGraphComponent } from './frontend-visual-graph/frontend-visual-graph.component';
import { SkillsService } from '../../services/skills.service';

@Component({
  selector: 'app-stack-explorer',
  standalone: true,
  imports: [CommonModule, StackModeToggleComponent, BackendTerminalComponent, FrontendVisualGraphComponent],
  template: `
    <section id="stack" class="py-24 px-4 md:px-8 relative w-full flex flex-col overflow-hidden">
      <!-- Ambient Grid Background -->
      <div class="absolute inset-0 pointer-events-none grid-bg opacity-30 z-0"></div>
      
      <!-- Glow Orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-backend)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none z-0"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-frontend)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none z-0"></div>

      <!-- Top Fade Overlay to blend sections (must be after grid to cover it) -->
      <div class="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-[var(--bg-base)] via-[var(--bg-base)] to-transparent z-0 pointer-events-none opacity-95"></div>

      <!-- Bottom Fade Overlay to blend into next section -->
      <div class="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[var(--bg-base)] to-transparent z-0 pointer-events-none opacity-95"></div>

      <div class="w-full max-w-6xl mx-auto flex-1 flex flex-col relative z-10">
        
        <div class="mb-12 text-center">
          <h2 class="text-3xl md:text-5xl font-display font-bold mb-4">
            <span class="text-[var(--text-muted)]">&lt;</span>
            Explorador de Stack
            <span class="text-[var(--text-muted)]">/&gt;</span>
          </h2>
          <p class="text-[var(--text-muted)] max-w-2xl mx-auto">
            Descubra minha proficiência técnica alternando entre o mapa visual da arquitetura ou o simulador interativo de código.
          </p>
        </div>

        <app-stack-mode-toggle 
          [mode]="activeMode()" 
          (toggle)="toggleMode()"
          class="mx-auto block mb-8 relative z-20">
        </app-stack-mode-toggle>

        <!-- Container for transitions using CSS Grid to allow auto-height -->
        <div class="grid w-full flex-1">
          
          <div class="col-start-1 row-start-1 transition-all duration-500 transform w-full"
               [class.opacity-100]="activeMode() === 'visual'"
               [class.translate-x-0]="activeMode() === 'visual'"
               [class.z-10]="activeMode() === 'visual'"
               [class.opacity-0]="activeMode() === 'terminal'"
               [class.-translate-x-8]="activeMode() === 'terminal'"
               [class.z-0]="activeMode() === 'terminal'"
               [class.pointer-events-none]="activeMode() === 'terminal'">
            <app-frontend-visual-graph [skills]="allSkills()" [isVisible]="activeMode() === 'visual'"></app-frontend-visual-graph>
          </div>

          <div class="col-start-1 row-start-1 transition-all duration-500 transform w-full"
               [class.opacity-100]="activeMode() === 'terminal'"
               [class.translate-x-0]="activeMode() === 'terminal'"
               [class.z-10]="activeMode() === 'terminal'"
               [class.opacity-0]="activeMode() === 'visual'"
               [class.translate-x-8]="activeMode() === 'visual'"
               [class.z-0]="activeMode() === 'visual'"
               [class.pointer-events-none]="activeMode() === 'visual'">
            <app-backend-terminal></app-backend-terminal>
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
    `
  ]
})
export class StackExplorerComponent {
  private skillsService = inject(SkillsService);
  
  activeMode = this.skillsService.activeMode;
  
  // Combine both frontend and backend skills into a single array for the visual mode
  allSkills = computed(() => {
    return [...this.skillsService.frontendSkills(), ...this.skillsService.backendSkills()];
  });

  toggleMode() {
    this.skillsService.toggleMode();
  }
}
