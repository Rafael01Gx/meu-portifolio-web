import { Component, ElementRef, ViewChild, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { PROFILE } from '../../data/profile.data';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <footer id="contact" #footerRef class="bg-gradient-to-b from-[var(--bg-base)] to-[var(--bg-surface)] py-16 px-6 md:px-12">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div class="text-center md:text-left">
          <h2 class="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">{{ profile.name }}</h2>
          <p class="text-[var(--text-muted)]">{{ profile.role }}</p>
        </div>

        <div class="flex items-center gap-6">
          <a [href]="profile.github" target="_blank" rel="noopener noreferrer"
             class="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:scale-110 transition-all duration-300"
             aria-label="GitHub">
            <ng-icon name="lucideGithub" size="28"></ng-icon>
          </a>
          <a [href]="profile.linkedin" target="_blank" rel="noopener noreferrer"
             class="text-[var(--text-muted)] hover:text-[var(--accent-frontend)] hover:scale-110 transition-all duration-300"
             aria-label="LinkedIn">
            <ng-icon name="lucideLinkedin" size="28"></ng-icon>
          </a>
          <a [href]="'mailto:' + profile.email"
             class="text-[var(--text-muted)] hover:text-[var(--accent-backend)] hover:scale-110 transition-all duration-300"
             aria-label="Email">
            <ng-icon name="lucideMail" size="28"></ng-icon>
          </a>
        </div>
        
      </div>
      <div class="max-w-6xl mx-auto mt-12 text-center border-t border-[var(--border-line)] pt-8">
        <p class="text-[var(--text-muted)] text-sm font-mono">
          © {{ currentYear }} {{ profile.name }}. All rights reserved.
        </p>
      </div>
    </footer>
  `
})
export class SiteFooterComponent {
  profile = PROFILE;
  currentYear = new Date().getFullYear();
  
  private animationService = inject(AnimationService);
  @ViewChild('footerRef') footerRef!: ElementRef;

  constructor() {
    afterNextRender(() => {
      if (this.footerRef) {
        this.animationService.revealOnScroll(this.footerRef.nativeElement);
      }
    });
  }
}
