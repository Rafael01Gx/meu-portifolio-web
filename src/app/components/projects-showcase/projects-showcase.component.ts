import { Component, ElementRef, ViewChildren, ViewChild, QueryList, afterNextRender, inject, signal, computed, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { ProjectCardComponent } from './project-card/project-card.component';
import { ProjectsService } from '../../services/projects.service';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-projects-showcase',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent, NgIconComponent],
  template: `
    <section id="projects" class="py-24 px-6 md:px-12 bg-[var(--bg-base)] relative overflow-hidden">
      <!-- Background Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-[var(--accent-active)]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-6xl mx-auto relative z-10">
        <div class="mb-16 text-center">
          <h2 class="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">
            <span class="text-[var(--text-muted)]">&lt;</span>
            Projetos em Destaque
            <span class="text-[var(--text-muted)]">/&gt;</span>
          </h2>
          <p class="text-[var(--text-muted)] max-w-2xl mx-auto">Aplicações desenvolvidas com foco em arquitetura em camadas, performance e boas práticas de engenharia de software.</p>
        </div>

        <!-- IDE Console Window -->
        <div #ideConsole class="max-w-3xl mx-auto bg-[#1E1E1E]/95 backdrop-blur-md rounded-xl border border-[var(--border-line)] shadow-2xl overflow-hidden opacity-0 scale-95 transform-gpu">
          <!-- Mac OS Header -->
          <div class="bg-[#2D2D2D]/90 px-4 py-3 flex items-center gap-2 border-b border-black/30">
            <div class="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div class="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div class="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            <div class="mx-auto text-xs font-mono text-[#ABB2BF]">build-projects.ts</div>
          </div>
          <!-- Editor Body -->
          <div class="p-6 font-mono text-sm md:text-base overflow-x-auto whitespace-pre leading-relaxed min-h-[220px]">
            <code class="text-[#ABB2BF]" [innerHTML]="highlightedCode()"></code><span class="w-2.5 h-5 bg-[#528BFF] inline-block animate-pulse ml-1 align-middle" [class.hidden]="isTypingFinished()"></span>
          </div>
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          @for (project of projectsService.projects(); track project.id) {
            <div #projectCardWrapper class="opacity-0 translate-y-12 scale-95 transform-gpu">
              <app-project-card [project]="project"></app-project-card>
            </div>
          }
        </div>

        <div #projectCardWrapper class="flex justify-center opacity-0 translate-y-12 scale-95 transform-gpu">
          <a href="https://github.com/Rafael01Gx?tab=repositories" target="_blank" rel="noopener noreferrer" 
             class="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[var(--text-primary)] transition-all duration-300 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-full hover:border-[var(--accent-active)] hover:shadow-[0_0_20px_rgba(var(--accent-active-rgb),0.2)] overflow-hidden">
            <span class="relative z-10 flex items-center gap-2">
              Ver mais projetos no GitHub
              <ng-icon name="lucideGithub" size="20" class="group-hover:scale-110 transition-transform"></ng-icon>
            </span>
          </a>
        </div>
      </div>
    </section>
  `
})
export class ProjectsShowcaseComponent implements OnDestroy {
  projectsService = inject(ProjectsService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('ideConsole') ideConsole!: ElementRef;
  @ViewChildren('projectCardWrapper') projectCards!: QueryList<ElementRef>;
  
  private hasAnimated = false;
  private typewriterInterval: any;
  private scrollTriggerInstance: any;
  isTypingFinished = signal(false);
  displayedCode = signal('');

  rawCode = `import { Renderer } from '@portfolio/core';

async function bootstrapProjects() {
  console.log("Compiling UI Components...");
  
  await Renderer.mount({
    target: 'ProjectsGrid',
    framework: 'Angular v17 + GSAP'
  });
  
  console.log("Projects deployed successfully!");
}

bootstrapProjects();`;

  highlightedCode = computed<SafeHtml>(() => {
    let code = this.displayedCode();
    // Strings first to avoid matching class="..." from subsequent replacements
    code = code.replace(/(['"`])(.*?)\1/g, '<span class="text-[#98C379]">$1$2$1</span>');
    code = code.replace(/\b(import|from|async|function|await|const|let|return)\b/g, '<span class="text-[#C678DD]">$1</span>');
    code = code.replace(/\b(console|Renderer)\b/g, '<span class="text-[#E5C07B]">$1</span>');
    code = code.replace(/\b(log|mount)\b/g, '<span class="text-[#61AFEF]">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(code);
  });

  constructor() {
    afterNextRender(() => {
      this.scrollTriggerInstance = ScrollTrigger.create({
        trigger: '#projects',
        start: 'top 60%',
        onEnter: () => {
          if (!this.hasAnimated) {
            this.hasAnimated = true;
            this.startIdeAnimation();
          }
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    if (this.scrollTriggerInstance) this.scrollTriggerInstance.kill();
  }

  startIdeAnimation() {
    gsap.to(this.ideConsole.nativeElement, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.2)',
      onComplete: () => {
        this.typeCode();
      }
    });
  }

  typeCode() {
    let i = 0;
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    
    this.typewriterInterval = setInterval(() => {
      this.displayedCode.update(v => v + this.rawCode.charAt(i));
      i++;

      if (i >= this.rawCode.length) {
         clearInterval(this.typewriterInterval);
         this.isTypingFinished.set(true);
         this.hideIdeAndReveal();
      }
    }, 25);
  }

  hideIdeAndReveal() {
    // Brief pause so user can read the last line before fade
    gsap.to(this.ideConsole.nativeElement, {
      opacity: 0,
      scale: 0.95,
      y: -20,
      duration: 0.6,
      ease: 'power2.in',
      delay: 0.6,
      onComplete: () => {
        // Collapse height smoothly
        gsap.to(this.ideConsole.nativeElement, {
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => this.revealProjects()
        });
      }
    });
  }

  revealProjects() {
    const cards = this.projectCards.map(c => c.nativeElement);
    gsap.to(cards, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }
}

