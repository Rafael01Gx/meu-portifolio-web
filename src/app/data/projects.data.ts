import { Project } from '../models/project.model';

export const PROJECTS: Project[] = [
  {
    id: 'rest-api-spring-boot',
    title: 'API REST com Spring Boot',
    description: 'API REST com arquitetura em camadas, autenticação JWT via Spring Security, persistência com PostgreSQL via JPA/Hibernate, testes unitários com JUnit 5 e Mockito, documentação de endpoints com Swagger.',
    stack: ['java', 'spring-boot', 'spring-security', 'postgresql', 'junit5', 'swagger'],
    repoUrl: 'https://github.com/Rafael01Gx/SUBSTITUIR_PELO_NOME_DO_REPO',
    highlight: true,
  },
  {
    id: 'backend-mensageria',
    title: 'Sistema Backend com Mensageria',
    description: 'Comunicação assíncrona entre serviços via RabbitMQ, separação de responsabilidades por domínio, persistência poliglota (PostgreSQL e MongoDB), infraestrutura como código com AWS CDK, containerizado com Docker.',
    stack: ['spring-boot', 'rabbitmq', 'postgresql', 'mongodb', 'aws', 'docker'],
    repoUrl: 'https://github.com/Rafael01Gx/SUBSTITUIR_PELO_NOME_DO_REPO',
  },
  {
    id: 'sistema-gestao-corporativa',
    title: 'Sistema de Gestão Corporativa (Backend)',
    description: 'Backend completo em Java com Spring Boot, controle de autenticação e autorização com Spring Security, implantação em nuvem via Amazon EC2, integração contínua com GitHub Actions para deploy automatizado, otimização de consultas com JPA e documentação técnica do sistema.',
    stack: ['java', 'spring-boot', 'spring-security', 'aws', 'github-actions'],
    repoUrl: 'https://github.com/Rafael01Gx/SUBSTITUIR_PELO_NOME_DO_REPO',
  },
];
