import {
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  signal,
  OnDestroy,
} from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { PROFILE } from '../../data/profile.data';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-resume-cta',
  standalone: true,
  imports: [NgIconComponent],
  styles: `
    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.7; }
    }
    @keyframes float-code {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.07; }
      90% { opacity: 0.07; }
      100% { transform: translateY(-120px) rotate(8deg); opacity: 0; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes border-flow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .status-dot {
      animation: pulse-dot 1.8s ease-in-out infinite;
    }
    .floating-char {
      animation: float-code linear infinite;
      position: absolute;
      font-family: monospace;
      font-size: 0.85rem;
      color: var(--accent-active);
      pointer-events: none;
      user-select: none;
    }
    .shimmer-text {
      background: linear-gradient(
        90deg,
        var(--text-primary) 0%,
        var(--accent-active) 30%,
        #a78bfa 50%,
        var(--accent-active) 70%,
        var(--text-primary) 100%
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3.5s linear infinite;
    }
    .btn-gradient-border {
      position: relative;
      background: var(--bg-surface);
      border-radius: 9999px;
    }
    .btn-gradient-border::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 9999px;
      background: linear-gradient(270deg, var(--accent-active), #a78bfa, var(--accent-active));
      background-size: 300% 300%;
      animation: border-flow 3s ease infinite;
      z-index: -1;
    }
    .download-icon-wrap {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .btn-gradient-border:hover .download-icon-wrap {
      transform: translateY(4px);
    }
  `,
  template: `
    <section id="contact" class="relative py-32 px-6 md:px-12 overflow-hidden bg-[var(--bg-base)]">

      <!-- Floating Code Chars background -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        @for (c of floatingChars; track c.id) {
          <span class="floating-char"
            [style.left]="c.left"
            [style.top]="c.top"
            [style.animationDuration]="c.duration"
            [style.animationDelay]="c.delay"
            [style.fontSize]="c.size">{{ c.char }}</span>
        }
      </div>

      <!-- Radial glow -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div class="w-[800px] h-[500px] rounded-full opacity-10"
          style="background: radial-gradient(ellipse, var(--accent-active) 0%, transparent 70%); filter: blur(60px);">
        </div>
      </div>

      <div #ctaRef class="relative z-10 max-w-4xl mx-auto text-center">


        <!-- Main heading -->
        <h2 #heading class="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight opacity-0">
          <span class="shimmer-text">Vamos construir</span><br>
          <span class="text-[var(--text-primary)]">algo incrível juntos.</span>
        </h2>

        <!-- Subtext -->
        <p #subtext class="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed opacity-0">
          Sou especialista em arquitetura backend Java, APIs RESTful e sistemas distribuídos. 
          Pronto para novos desafios que exijam solidez técnica e visão de engenharia.
        </p>

        <!-- CTA Buttons -->
        <div #buttons class="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20 opacity-0">
          <!-- CV Download -->
          <a href="/doc/rafael_backend_mg_cv.pdf"
             download="Rafael_Moraes_CV.pdf"
             id="btn-download-cv"
             class="btn-gradient-border group flex items-center gap-3 px-8 py-4 font-bold text-[var(--text-primary)] text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <span class="relative z-10 flex items-center gap-3">
              <span class="font-mono text-sm text-[var(--accent-active)] opacity-80">./</span>
              Download CV
              <span class="download-icon-wrap">
                <ng-icon name="lucideDownload" size="18"></ng-icon>
              </span>
            </span>
          </a>

          <!-- LinkedIn -->
          <a [href]="profile.linkedin" target="_blank" rel="noopener noreferrer"
             id="btn-linkedin"
             class="group flex items-center gap-3 px-8 py-4 font-bold text-[var(--text-muted)] text-base border border-[var(--border-line)] rounded-full transition-all duration-300 hover:border-[var(--accent-active)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">
            <ng-icon name="lucideLinkedin" size="18" class="group-hover:scale-110 transition-transform"></ng-icon>
            LinkedIn
          </a>

          <!-- Email -->
          <a [href]="'mailto:' + profile.email"
             id="btn-email"
             class="group flex items-center gap-3 px-8 py-4 font-bold text-[var(--text-muted)] text-base border border-[var(--border-line)] rounded-full transition-all duration-300 hover:border-[var(--accent-active)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">
            <ng-icon name="lucideMail" size="18" class="group-hover:scale-110 transition-transform"></ng-icon>
            Enviar e-mail
          </a>
        </div>

        <!-- Status badge -->
        <div #statusBadge class="inline-flex items-center gap-2.5 px-5 py-2 bg-[var(--bg-surface)] border border-[var(--border-line)] rounded-full mb-10 opacity-0">
          <span class="status-dot w-2.5 h-2.5 rounded-full bg-emerald-400 block"></span>
          <span class="text-sm font-mono text-emerald-400 font-medium tracking-wider uppercase">Disponível para contratação</span>
        </div>

      </div>
    </section>
  `
})
export class ResumeCta implements OnDestroy {
  profile = PROFILE;

  private scrollTriggerInstance: any;

  floatingChars = this.generateFloatingChars();

  @ViewChild('statusBadge') statusBadge!: ElementRef;
  @ViewChild('heading') heading!: ElementRef;
  @ViewChild('subtext') subtext!: ElementRef;
  @ViewChild('buttons') buttons!: ElementRef;
  @ViewChild('divider') divider!: ElementRef;
  @ViewChild('socials') socials!: ElementRef;

  constructor() {
    afterNextRender(() => {
      this.scrollTriggerInstance = ScrollTrigger.create({
        trigger: '#contact',
        start: 'top 65%',
        onEnter: () => this.runEntrance(),
      });
    });
  }

  runEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(this.statusBadge.nativeElement, { opacity: 1, y: 0, duration: 0.6, from: { y: 20 } })
      .to(this.heading.nativeElement, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .to(this.subtext.nativeElement, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .to(this.buttons.nativeElement, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' }, '-=0.4')
      .to(this.divider.nativeElement, { opacity: 1, duration: 0.5 }, '-=0.2')
      .to(this.socials.nativeElement, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

    // Set initial Y states before animating
    gsap.set([
      this.statusBadge.nativeElement,
      this.heading.nativeElement,
      this.subtext.nativeElement,
      this.buttons.nativeElement,
      this.socials.nativeElement,
    ], { y: 30 });
    tl.restart();
  }

  generateFloatingChars() {
    const chars = ['{ }', '//', '=>', '&&', '[]', '<>', ';;', '01', '10', '||', '**', '~~', '@', '#', '::'];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      char: chars[i % chars.length],
      left: `${5 + Math.random() * 90}%`,
      top: `${Math.random() * 100}%`,
      duration: `${6 + Math.random() * 10}s`,
      delay: `${Math.random() * -10}s`,
      size: `${0.65 + Math.random() * 0.6}rem`,
    }));
  }

  ngOnDestroy() {
    if (this.scrollTriggerInstance) this.scrollTriggerInstance.kill();
  }
}
