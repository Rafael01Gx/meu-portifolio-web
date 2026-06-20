import { Component } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { PROFILE } from '../../data/profile.data';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [NgIconComponent],
  styles: `
    @keyframes scan-line {
      0% { transform: translateY(-100%); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(2000%); opacity: 0; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .scan-line {
      animation: scan-line 6s linear infinite;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-active), transparent);
      position: absolute;
      width: 100%;
      left: 0;
      pointer-events: none;
    }
    .cursor-blink {
      animation: blink 1.1s step-end infinite;
    }
    .social-link {
      transition: color 0.2s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .social-link:hover {
      transform: translateY(-3px);
    }
  `,
  template: `
    <footer class="relative bg-[var(--bg-surface)] overflow-hidden">

      <!-- Fade from previous section -->
      <div class="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--bg-base)] to-transparent pointer-events-none z-10" aria-hidden="true"></div>

      <!-- Subtle scan line animation -->
      <div class="scan-line" aria-hidden="true"></div>

      <div class="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-12">

        <!-- Top row: Brand + Nav links + Socials -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-10 mb-10">

          <!-- Brand / Name -->
          <div class="text-center md:text-left">
            <p class="font-mono text-xs text-[var(--accent-active)] tracking-widest uppercase mb-1">// engenheiro de software</p>
            <h2 class="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">
              {{ profile.name }}<span class="cursor-blink text-[var(--accent-active)] ml-0.5">_</span>
            </h2>
            <p class="text-[var(--text-muted)] text-sm mt-1">{{ profile.role }}</p>
          </div>

          <!-- Quick nav anchors -->
          <nav class="flex flex-wrap items-center justify-center gap-x-8 gap-y-2" aria-label="Footer navigation">
            @for (link of navLinks; track link.label) {
              <a [href]="link.href"
                 class="text-sm font-mono text-[var(--text-muted)] hover:text-[var(--accent-active)] transition-colors duration-200 relative group">
                {{ link.label }}
                <span class="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--accent-active)] transition-all duration-300 group-hover:w-full"></span>
              </a>
            }
          </nav>

          <!-- Social icons -->
          <div class="flex items-center gap-5">
            <a [href]="profile.github" target="_blank" rel="noopener noreferrer"
               aria-label="GitHub"
               class="social-link text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <ng-icon name="lucideGithub" size="22"></ng-icon>
            </a>
            <a [href]="profile.linkedin" target="_blank" rel="noopener noreferrer"
               aria-label="LinkedIn"
               class="social-link text-[var(--text-muted)] hover:text-[#0A66C2]">
              <ng-icon name="lucideLinkedin" size="22"></ng-icon>
            </a>
            <a [href]="'mailto:' + profile.email"
               aria-label="Email"
               class="social-link text-[var(--text-muted)] hover:text-[var(--accent-active)]">
              <ng-icon name="lucideMail" size="22"></ng-icon>
            </a>
          </div>

        </div>

        <!-- Divider -->
        <div class="border-t border-[var(--border-line)] mb-6"></div>

        <!-- Bottom row: Copyright + Stack tag -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--text-muted)]">
          <p>© {{ currentYear }} {{ profile.name }}. Todos os direitos reservados.</p>
          <p class="opacity-60">Feito com <span class="text-[var(--accent-active)]">Angular 21</span> + <span class="text-purple-400">GSAP</span> · Zoneless</p>
        </div>

      </div>
    </footer>
  `
})
export class SiteFooterComponent {
  profile = PROFILE;
  currentYear = new Date().getFullYear();

  navLinks = [
    { label: '#início', href: '#' },
    { label: '#tecnologias', href: '#stack' },
    { label: '#projetos', href: '#projects' },
    { label: '#contato', href: '#contact' },
  ];
}
