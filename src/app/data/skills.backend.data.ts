import { Skill } from '../models/skill.model';

export const BACKEND_SKILLS: Skill[] = [
  { id: 'java', name: 'Java 17', category: 'backend-core', proficiency: 'core', icon: 'lucideCoffee', connectsTo: ['spring-boot', 'junit5', 'maven'], usedInProjects: ['rest-api-spring-boot', 'sistema-gestao-corporativa'] },
  { id: 'spring-boot', name: 'Spring Boot', category: 'backend-core', proficiency: 'core', icon: 'simpleSpringboot', connectsTo: ['java', 'spring-security', 'postgresql', 'mongodb', 'rabbitmq'], usedInProjects: ['rest-api-spring-boot', 'backend-mensageria', 'sistema-gestao-corporativa'] },
  { id: 'spring-security', name: 'Spring Security', category: 'backend-core', proficiency: 'core', icon: 'lucideShield', connectsTo: ['spring-boot'], usedInProjects: ['rest-api-spring-boot', 'sistema-gestao-corporativa'] },
  { id: 'spring-data-jpa', name: 'Spring Data JPA', category: 'backend-core', proficiency: 'core', icon: 'lucideDatabase', connectsTo: ['spring-boot', 'hibernate', 'postgresql', 'mysql'], usedInProjects: ['rest-api-spring-boot', 'sistema-gestao-corporativa'] },
  { id: 'spring-cloud', name: 'Spring Cloud', category: 'backend-core', proficiency: 'familiar', icon: 'simpleSpringboot', connectsTo: ['spring-boot'], usedInProjects: [] },
  { id: 'hibernate', name: 'Hibernate', category: 'backend-core', proficiency: 'core', icon: 'lucideDatabase', connectsTo: ['spring-data-jpa', 'java'], usedInProjects: ['rest-api-spring-boot'] },
  { id: 'postgresql', name: 'PostgreSQL', category: 'data', proficiency: 'core', icon: 'simplePostgresql', connectsTo: ['spring-data-jpa', 'spring-boot'], usedInProjects: ['rest-api-spring-boot', 'backend-mensageria'] },
  { id: 'mysql', name: 'MySQL', category: 'data', proficiency: 'proficient', icon: 'simpleMysql', connectsTo: ['spring-data-jpa'], usedInProjects: [] },
  { id: 'mongodb', name: 'MongoDB', category: 'data', proficiency: 'familiar', icon: 'simpleMongodb', connectsTo: ['spring-boot'], usedInProjects: ['backend-mensageria'] },
  { id: 'rabbitmq', name: 'RabbitMQ', category: 'data', proficiency: 'proficient', icon: 'simpleRabbitmq', connectsTo: ['spring-boot'], usedInProjects: ['backend-mensageria'] },
  { id: 'apache-kafka', name: 'Apache Kafka', category: 'data', proficiency: 'familiar', icon: 'simpleApachekafka', connectsTo: ['spring-boot'], usedInProjects: [] },
  { id: 'aws', name: 'AWS', category: 'devops', proficiency: 'familiar', icon: 'lucideCloud', connectsTo: ['docker', 'github-actions'], usedInProjects: ['backend-mensageria', 'sistema-gestao-corporativa'] },
  { id: 'docker', name: 'Docker', category: 'devops', proficiency: 'proficient', icon: 'simpleDocker', connectsTo: ['spring-boot', 'postgresql', 'rabbitmq', 'mongodb'], usedInProjects: ['backend-mensageria'] },
  { id: 'git', name: 'Git', category: 'devops', proficiency: 'core', icon: 'simpleGit', connectsTo: ['github-actions'], usedInProjects: [] },
  { id: 'github-actions', name: 'GitHub Actions', category: 'devops', proficiency: 'familiar', icon: 'simpleGithubactions', connectsTo: ['git', 'maven', 'docker', 'aws'], usedInProjects: ['sistema-gestao-corporativa'] },
  { id: 'maven', name: 'Maven', category: 'devops', proficiency: 'core', icon: 'simpleApachemaven', connectsTo: ['java', 'spring-boot'], usedInProjects: [] },
  { id: 'swagger', name: 'Swagger / OpenAPI', category: 'devops', proficiency: 'proficient', icon: 'simpleSwagger', connectsTo: ['spring-boot'], usedInProjects: ['rest-api-spring-boot'] },
  { id: 'junit5', name: 'JUnit 5', category: 'testes', proficiency: 'core', icon: 'simpleJunit5', connectsTo: ['java', 'spring-boot', 'mockito'], usedInProjects: ['rest-api-spring-boot'] },
  { id: 'mockito', name: 'Mockito', category: 'testes', proficiency: 'core', icon: 'lucideTestTube', connectsTo: ['junit5', 'java'], usedInProjects: ['rest-api-spring-boot'] },
];
