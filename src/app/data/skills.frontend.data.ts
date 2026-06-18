import { Skill } from '../models/skill.model';

export const FRONTEND_SKILLS: Skill[] = [
  { id: 'angular', name: 'Angular 21', category: 'frontend', proficiency: 'core', icon: 'simpleAngular', connectsTo: ['typescript', 'rxjs', 'tailwind-css', 'html5'], usedInProjects: [] },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', proficiency: 'core', icon: 'simpleTypescript', connectsTo: ['angular'], usedInProjects: [] },
  { id: 'tailwind-css', name: 'Tailwind CSS 4.2', category: 'frontend', proficiency: 'proficient', icon: 'simpleTailwindcss', connectsTo: ['css3', 'angular'], usedInProjects: [] },
  { id: 'rxjs', name: 'RxJS / Signals', category: 'frontend', proficiency: 'proficient', icon: 'lucideWaves', connectsTo: ['angular'], usedInProjects: [] },
  { id: 'html5', name: 'HTML5', category: 'frontend', proficiency: 'core', icon: 'simpleHtml5', connectsTo: ['angular', 'css3'], usedInProjects: [] },
  { id: 'css3', name: 'CSS3', category: 'frontend', proficiency: 'core', icon: 'simpleCss', connectsTo: ['html5', 'tailwind-css'], usedInProjects: [] },
  { id: 'gsap', name: 'GSAP', category: 'frontend', proficiency: 'familiar', icon: 'simpleGreensock', connectsTo: ['javascript', 'angular'], usedInProjects: [] },
];
