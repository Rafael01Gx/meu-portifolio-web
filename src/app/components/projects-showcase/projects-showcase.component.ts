import { Component, ElementRef, ViewChildren, QueryList, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from './project-card/project-card.component';
import { ProjectsService } from '../../services/projects.service';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-projects-showcase',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  template: `
    <section id="projects" class="py-24 px-6 md:px-12 bg-[var(--bg-base)] relative">
      <div class="max-w-6xl mx-auto">
        <div class="mb-16">
          <h2 class="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">Projetos em Destaque</h2>
          <p class="text-[var(--text-muted)] max-w-2xl">Aplicações desenvolvidas com foco em arquitetura em camadas, performance e boas práticas de engenharia de software.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (project of projectsService.projects(); track project.id) {
            <div #projectCardWrapper>
              <app-project-card [project]="project"></app-project-card>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class ProjectsShowcaseComponent {
  projectsService = inject(ProjectsService);
  private animationService = inject(AnimationService);

  @ViewChildren('projectCardWrapper') projectCards!: QueryList<ElementRef>;

  constructor() {
    afterNextRender(() => {
      const elements = this.projectCards.map(c => c.nativeElement);
      if (elements.length > 0) {
        this.animationService.revealOnScroll(elements);
      }
    });
  }
}
