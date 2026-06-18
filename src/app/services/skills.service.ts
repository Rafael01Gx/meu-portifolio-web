import { Injectable, signal, computed } from '@angular/core';
import { BACKEND_SKILLS } from '../data/skills.backend.data';
import { FRONTEND_SKILLS } from '../data/skills.frontend.data';
import { Skill } from '../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private backendSignal = signal<Skill[]>(BACKEND_SKILLS);
  private frontendSignal = signal<Skill[]>(FRONTEND_SKILLS);

  // State for Stack Explorer toggle
  private activeModeSignal = signal<'visual' | 'terminal'>('terminal');
  activeMode = this.activeModeSignal.asReadonly();

  toggleMode() {
    this.activeModeSignal.update(mode => mode === 'visual' ? 'terminal' : 'visual');
  }

  get backendSkills() {
    return this.backendSignal.asReadonly();
  }

  get frontendSkills() {
    return this.frontendSignal.asReadonly();
  }

  get allSkills() {
    return computed(() => [...this.backendSignal(), ...this.frontendSignal()]);
  }
}
