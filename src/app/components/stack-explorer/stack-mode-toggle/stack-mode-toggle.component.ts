import { Component, input, output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stack-mode-toggle',
  standalone: true,
  imports: [NgIconComponent, CommonModule],
  template: `
    <div class="flex items-center justify-center gap-4 mb-8">
      <span class="text-sm font-display tracking-widest font-bold transition-colors"
            [class.text-[var(--accent-frontend)]]="mode() === 'visual'"
            [class.text-[var(--text-muted)]]="mode() === 'terminal'">
        VISUAL
      </span>
      
      <button 
        (click)="toggle.emit()"
        class="focus:outline-none focus:ring-2 focus:ring-[var(--accent-active)] rounded-full transition-colors text-[var(--text-primary)] hover:text-[var(--accent-active)]"
        [attr.aria-label]="'Alternar para modo ' + (mode() === 'visual' ? 'terminal' : 'visual')">
        <ng-icon 
          [name]="mode() === 'visual' ? 'lucideToggleLeft' : 'lucideToggleRight'" 
          size="40" 
          class="transition-transform duration-300">
        </ng-icon>
      </button>

      <span class="text-sm font-display tracking-widest font-bold transition-colors"
            [class.text-[var(--accent-backend)]]="mode() === 'terminal'"
            [class.text-[var(--text-muted)]]="mode() === 'visual'">
        CÓDIGO
      </span>
    </div>
  `
})
export class StackModeToggleComponent {
  mode = input<'visual' | 'terminal'>('visual');
  toggle = output<void>();
}
