import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="group bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-2xl p-6 md:p-8 flex flex-col h-full transition-all duration-300 hover:border-[var(--accent-active)] hover:shadow-lg hover:shadow-[var(--accent-active)]/10"
         [class.border-t-4]="project().highlight"
         [style.border-top-color]="project().highlight ? 'var(--accent-active)' : ''">
      
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-xl md:text-2xl font-display font-bold group-hover:text-[var(--accent-active)] transition-colors">{{ project().title }}</h3>
        <a [href]="project().repoUrl" target="_blank" rel="noopener noreferrer" 
           class="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2"
           aria-label="Ver código no GitHub">
          <ng-icon name="lucideGithub" size="24"></ng-icon>
        </a>
      </div>

      <p class="text-[var(--text-muted)] leading-relaxed flex-1 mb-8">
        {{ project().description }}
      </p>

      <div class="mt-auto">
        <h4 class="text-xs font-bold text-[var(--text-muted)] uppercase mb-3 tracking-wider">Stack</h4>
        <div class="flex flex-wrap gap-2">
          @for (tech of project().stack; track tech) {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-line)] rounded-md">
              {{ tech }}
            </span>
          }
        </div>
      </div>
    </div>
  `
})
export class ProjectCardComponent {
  project = input.required<Project>();
}
