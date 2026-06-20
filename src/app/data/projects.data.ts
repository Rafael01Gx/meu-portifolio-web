import { Project } from '../models/project.model';

export const PROJECTS: Project[] = [
  {
    id: 'inspectflow-backend',
    title: 'InspectFlow Backend',
    description: 'Plataforma backend robusta para gestão inteligente de inspeções industriais e manutenção. Rastreabilidade completa com Clean Architecture, DDD e arquitetura orientada a eventos usando Outbox Pattern.',
    stack: ['Java 25', 'Spring Boot 4.x', 'Spring Security', 'PostgreSQL', 'MongoDB', 'Docker', 'DDD'],
    repoUrl: 'https://github.com/Rafael01Gx/inspectflow-backend',
    highlight: true,
  },
  {
    id: 'inspectflow-frontend',
    title: 'InspectFlow Frontend',
    description: 'Interface moderna e responsiva para gestão de inspeções em campo. Design mobile-first, alta performance com lazy loading e experiência intuitiva, consumindo a API robusta do backend.',
    stack: ['Angular 21', 'TypeScript', 'RxJS', 'TailwindCSS 4', 'Chart.js', 'Cypress', 'Jest'],
    repoUrl: 'https://github.com/Rafael01Gx/inspectflow-frontend',
    highlight: false,
  },
  {
    id: 'java-spring-cloud-microservices',
    title: 'Spring Cloud Microservices',
    description: 'Arquitetura prática de microsserviços utilizando o ecossistema Spring Cloud. Implementação de Service Discovery com Eureka, API Gateway, comunicação síncrona com OpenFeign e Circuit Breaker.',
    stack: ['Java 25', 'Spring Cloud', 'Eureka', 'API Gateway', 'MySQL', 'Flyway'],
    repoUrl: 'https://github.com/Rafael01Gx/java-spring-cloud-microservices',
    highlight: false,
  },
];
