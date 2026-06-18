export interface Skill {
  id: string;
  name: string;
  category: 'backend-core' | 'data' | 'devops' | 'testes' | 'frontend';
  proficiency: 'core' | 'proficient' | 'familiar';
  icon: string;
  connectsTo: string[];
  usedInProjects: string[];
}
