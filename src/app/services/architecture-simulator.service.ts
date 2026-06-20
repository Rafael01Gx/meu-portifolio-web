import { Injectable, signal } from '@angular/core';

export interface ArchitectureNode {
  id: string;
  type: 'frontend' | 'backend' | 'database' | 'messaging' | 'microservice' | 'ai' | 'gateway';
  name: string;
  icon: string;
  col: number;
  row: number;
}

export interface ArchitectureEdge {
  id: string;
  sourceId: string;
  targetId: string;
  protocol: 'http' | 'amqp' | 'tcp';
}

export interface TerminalOutput {
  command: string;
  response: string;
  isError?: boolean;
}

export interface FileNode {
  name: string;
  type: 'folder' | 'file';
  isOpen?: boolean;
  children?: FileNode[];
}

@Injectable({
  providedIn: 'root'
})
export class ArchitectureSimulatorService {
  private activeNodesSignal = signal<ArchitectureNode[]>([
    // Core Layer
    { id: 'angular', type: 'frontend', name: 'Storefront', icon: 'simpleAngular', col: 1, row: 2 },
    { id: 'nginx', type: 'gateway', name: 'API Gateway', icon: 'simpleNginx', col: 2, row: 2 },
    { id: 'spring-boot', type: 'backend', name: 'Order Orchestrator', icon: 'simpleSpringboot', col: 3, row: 2 },
    // Data Layer (core)
    { id: 'postgresql', type: 'database', name: 'Core DB', icon: 'simplePostgresql', col: 3, row: 3 },
    { id: 'mongodb', type: 'database', name: 'Catalog DB', icon: 'simpleMongodb', col: 4, row: 4 },
    // AI
    { id: 'langchain4j', type: 'ai', name: 'AI Recommendations', icon: 'lucideNetwork', col: 3, row: 1 },
    // Event Bus
    { id: 'kafka', type: 'messaging', name: 'Event Bus', icon: 'simpleApachekafka', col: 4, row: 2 },
    // Domain Microservices
    { id: 'ms-pedidos', type: 'microservice', name: 'ms-pedidos', icon: 'lucideCoffee', col: 5, row: 1 },
    { id: 'ms-pagamentos', type: 'microservice', name: 'ms-pagamentos', icon: 'lucideCoffee', col: 5, row: 2 },
    { id: 'ms-estoque', type: 'microservice', name: 'ms-estoque', icon: 'lucideCoffee', col: 5, row: 3 },
    { id: 'ms-notificacoes', type: 'microservice', name: 'ms-notificacoes', icon: 'lucideCoffee', col: 5, row: 4 },
    // Per-Service Databases
    { id: 'pg-pedidos', type: 'database', name: 'pg-pedidos', icon: 'simplePostgresql', col: 6, row: 1 },
    { id: 'pg-pagamentos', type: 'database', name: 'pg-pagamentos', icon: 'simplePostgresql', col: 6, row: 2 },
    { id: 'mongo-estoque', type: 'database', name: 'mongo-estoque', icon: 'simpleMongodb', col: 6, row: 3 },
    { id: 'mongo-notif', type: 'database', name: 'mongo-notif', icon: 'simpleMongodb', col: 6, row: 4 }
  ]);
  private activeEdgesSignal = signal<ArchitectureEdge[]>([
    // Core HTTP chain
    { id: 'angular-nginx', sourceId: 'angular', targetId: 'nginx', protocol: 'http' },
    { id: 'nginx-spring-boot', sourceId: 'nginx', targetId: 'spring-boot', protocol: 'http' },
    // Core Data
    { id: 'spring-boot-postgresql', sourceId: 'spring-boot', targetId: 'postgresql', protocol: 'tcp' },
    { id: 'spring-boot-mongodb', sourceId: 'spring-boot', targetId: 'mongodb', protocol: 'tcp' },
    // AI
    { id: 'spring-boot-langchain4j', sourceId: 'spring-boot', targetId: 'langchain4j', protocol: 'http' },
    // Event Bus
    { id: 'spring-boot-kafka', sourceId: 'spring-boot', targetId: 'kafka', protocol: 'tcp' },
    // Microservice Fan-out
    { id: 'kafka-ms-pedidos', sourceId: 'kafka', targetId: 'ms-pedidos', protocol: 'tcp' },
    { id: 'kafka-ms-pagamentos', sourceId: 'kafka', targetId: 'ms-pagamentos', protocol: 'tcp' },
    { id: 'kafka-ms-estoque', sourceId: 'kafka', targetId: 'ms-estoque', protocol: 'tcp' },
    { id: 'kafka-ms-notificacoes', sourceId: 'kafka', targetId: 'ms-notificacoes', protocol: 'tcp' },
    // Database-per-Service
    { id: 'ms-pedidos-pg-pedidos', sourceId: 'ms-pedidos', targetId: 'pg-pedidos', protocol: 'tcp' },
    { id: 'ms-pagamentos-pg-pagamentos', sourceId: 'ms-pagamentos', targetId: 'pg-pagamentos', protocol: 'tcp' },
    { id: 'ms-estoque-mongo-estoque', sourceId: 'ms-estoque', targetId: 'mongo-estoque', protocol: 'tcp' },
    { id: 'ms-notificacoes-mongo-notif', sourceId: 'ms-notificacoes', targetId: 'mongo-notif', protocol: 'tcp' }
  ]);

  // A signal to trigger the ping animation in the UI
  private triggerPingSignal = signal<number>(0);

  private initialHelp = [
    'E-Commerce Microservices Platform v2.0',
    '─────────────────────────────────────',
    '  ng new web-app                          -> Inicia o Frontend Angular',
    '  docker run nginx                        -> Inicia o API Gateway (NGINX)',
    '  ./mvnw spring-boot:run                  -> Inicia o Order Orchestrator (Spring Boot)',
    '  docker run postgres                     -> Inicia o Banco Relacional Principal',
    '  docker run mongodb                      -> Inicia o Banco NoSQL (Catálogo)',
    '  docker run rabbitmq                     -> Inicia o Event Bus (RabbitMQ/Kafka)',
    '  add ai-module langchain4j               -> Acopla IA ao Spring Boot',
    '  add service <nome>                      -> Adiciona um novo microsserviço dinâmico',
    '  add database <tipo> <db> <target>       -> Acopla um DB a um microserviço (ex: add database postgres db-x ms-x)',
    '  deploy all                              -> Restaura a arquitetura enterprise completa',
    '  teste                                   -> Dispara teste de carga end-to-end',
    '  clear                                   -> Limpa a arquitetura e recomeça',
    '  help                                    -> Exibe este menu de ajuda'
  ].join('\n');

  private terminalHistorySignal = signal<TerminalOutput[]>([
    { command: 'boot', response: 'Inicializando plataforma de e-commerce enterprise...' },
    { command: 'kubectl apply -f k8s/', response: '16 pods deployed across 4 namespaces. All services healthy.' },
    { command: 'help', response: this.initialHelp }
  ]);

  private fileTreeSignal = signal<FileNode[]>([
    { name: 'README.md', type: 'file' },
    { name: 'frontend', type: 'folder', isOpen: true, children: [{ name: 'package.json', type: 'file' }, { name: 'src', type: 'folder', isOpen: false, children: [] }] },
    { name: 'gateway', type: 'folder', isOpen: false, children: [{ name: 'nginx.conf', type: 'file' }] },
    { name: 'order-orchestrator', type: 'folder', isOpen: true, children: [{ name: 'pom.xml', type: 'file' }, { name: 'src', type: 'folder', isOpen: false, children: [] }] },
    { name: 'ms-pedidos', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
    { name: 'ms-pagamentos', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
    { name: 'ms-estoque', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
    { name: 'ms-notificacoes', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
    { name: 'infra', type: 'folder', isOpen: true, children: [{ name: 'docker-compose.yml', type: 'file' }, { name: 'k8s', type: 'folder', isOpen: false, children: [] }] }
  ]);

  get activeNodes() { return this.activeNodesSignal.asReadonly(); }
  get activeEdges() { return this.activeEdgesSignal.asReadonly(); }
  get terminalHistory() { return this.terminalHistorySignal.asReadonly(); }
  get fileTree() { return this.fileTreeSignal.asReadonly(); }
  get triggerPing() { return this.triggerPingSignal.asReadonly(); }

  getAvailableCommands(): string[] {
    return [
      'help',
      'clear',
      'ng new web-app',
      'docker run nginx',
      './mvnw spring-boot:run',
      'docker run postgres',
      'docker run mongodb',
      'docker run rabbitmq',
      'add microservice-b',
      'add ai-module langchain4j',
      'deploy all',
      'teste'
    ];
  }

  executeCommand(cmd: string) {
    const rawCmd = cmd.trim();
    const normalizedCmd = rawCmd.toLowerCase();
    if (!normalizedCmd) return;

    let response = '';
    let isError = false;

    if (normalizedCmd === 'clear') {
      this.activeNodesSignal.set([]);
      this.activeEdgesSignal.set([]);
      this.fileTreeSignal.set([{ name: 'README.md', type: 'file' }]);
      this.terminalHistorySignal.set([]);
      return;
    } else if (normalizedCmd === 'help') {
      response = this.initialHelp;
    } else if (normalizedCmd === 'teste') {
      if (this.hasNode('angular') && this.hasNode('spring-boot')) {
        this.triggerPingSignal.update(v => v + 1); // Trigger the signal
        response = 'Iniciando teste de carga... Payload disparado do Angular, trafegando pela arquitetura!';
      } else {
        response = 'Erro: Para executar o teste, é necessário ter pelo menos o Angular e o Spring Boot rodando.';
        isError = true;
      }
    } else if (normalizedCmd.includes('ng new') || normalizedCmd === 'ng serve') {
      if (this.hasNode('angular')) {
        response = 'Frontend Angular já está em execução!';
      } else {
        this.addNode({ id: 'angular', type: 'frontend', name: 'Angular App', icon: 'simpleAngular', col: 1, row: 2 });
        this.addFilesToTree('frontend', [
          { name: 'src', type: 'folder', isOpen: true, children: [{ name: 'main.ts', type: 'file' }, { name: 'app.component.ts', type: 'file' }] },
          { name: 'angular.json', type: 'file' },
          { name: 'package.json', type: 'file' }
        ]);
        if (this.hasNode('nginx')) this.addEdge('angular', 'nginx', 'http');
        response = ['CREATE portfolio/package.json (1024 bytes)', 'Frontend Angular iniciado. Aguardando conexões...'].join('\n');
      }
    } else if (normalizedCmd.includes('docker run') && normalizedCmd.includes('nginx')) {
      if (this.hasNode('nginx')) {
        response = 'NGINX já está em execução!';
      } else {
        this.addNode({ id: 'nginx', type: 'gateway', name: 'API Gateway', icon: 'simpleNginx', col: 2, row: 2 });
        this.addFilesToTree('infraestrutura', [{ name: 'nginx.conf', type: 'file' }]);
        if (this.hasNode('angular')) this.addEdge('angular', 'nginx', 'http');
        if (this.hasNode('spring-boot')) this.addEdge('nginx', 'spring-boot', 'http');
        response = ['Starting NGINX...', 'Gateway rodando e escutando na porta 80. Roteamento preparado.'].join('\n');
      }
    } else if (normalizedCmd === './mvnw spring-boot:run') {
      if (this.hasNode('spring-boot')) {
        response = 'API Spring Boot já está em execução!';
      } else {
        this.addNode({ id: 'spring-boot', type: 'backend', name: 'Spring Boot API', icon: 'simpleSpringboot', col: 3, row: 2 });
        this.addFilesToTree('backend', [
          { name: 'src', type: 'folder', isOpen: true, children: [{ name: 'PortfolioApiApplication.java', type: 'file' }] },
          { name: 'pom.xml', type: 'file' }
        ]);
        // Connect Gateway to Spring Boot
        if (this.hasNode('nginx')) this.addEdge('nginx', 'spring-boot', 'http');
        // Legacy: if Angular exists but no Gateway, connect directly (fallback)
        else if (this.hasNode('angular')) this.addEdge('angular', 'spring-boot', 'http');

        if (this.hasNode('postgresql')) this.addEdge('spring-boot', 'postgresql', 'tcp');
        if (this.hasNode('mongodb')) this.addEdge('spring-boot', 'mongodb', 'tcp');
        if (this.hasNode('rabbitmq')) this.addEdge('spring-boot', 'rabbitmq', 'amqp');
        if (this.hasNode('langchain4j')) this.addEdge('spring-boot', 'langchain4j', 'http');
        response = ['Tomcat initialized with port(s): 8080 (http)', 'Started PortfolioApiApplication in 2.15 seconds'].join('\n');
      }
    } else if (normalizedCmd.includes('docker run') && normalizedCmd.includes('postgres')) {
      if (this.hasNode('postgresql')) {
        response = 'Container PostgreSQL já está rodando!';
      } else {
        this.addNode({ id: 'postgresql', type: 'database', name: 'PostgreSQL', icon: 'simplePostgresql', col: 5, row: 1 });
        this.addFilesToTree('infraestrutura', [{ name: 'docker-compose-db.yml', type: 'file' }]);
        if (this.hasNode('spring-boot')) this.addEdge('spring-boot', 'postgresql', 'tcp');
        response = ['Pulling image postgres:latest...', 'Database system is ready to accept connections on port 5432.'].join('\n');
      }
    } else if (normalizedCmd.includes('docker run') && normalizedCmd.includes('mongodb')) {
      if (this.hasNode('mongodb')) {
        response = 'Container MongoDB já está rodando!';
      } else {
        this.addNode({ id: 'mongodb', type: 'database', name: 'MongoDB', icon: 'simpleMongodb', col: 5, row: 3 });
        this.addFilesToTree('infraestrutura', [{ name: 'docker-compose-mongo.yml', type: 'file' }]);
        if (this.hasNode('spring-boot')) this.addEdge('spring-boot', 'mongodb', 'tcp');
        response = ['Starting MongoDB...', 'Waiting for connections on port 27017.'].join('\n');
      }
    } else if (normalizedCmd.includes('docker run') && normalizedCmd.includes('rabbitmq')) {
      if (this.hasNode('rabbitmq')) {
        response = 'Container RabbitMQ já está rodando!';
      } else {
        this.addNode({ id: 'rabbitmq', type: 'messaging', name: 'RabbitMQ', icon: 'simpleRabbitmq', col: 4, row: 2 });
        this.addFilesToTree('infraestrutura', [{ name: 'docker-compose-mq.yml', type: 'file' }]);
        if (this.hasNode('spring-boot')) this.addEdge('spring-boot', 'rabbitmq', 'amqp');
        if (this.hasNode('microservice-b')) this.addEdge('rabbitmq', 'microservice-b', 'amqp');
        response = ['Starting RabbitMQ...', 'Listening on AMQP port 5672.'].join('\n');
      }
    } else if (normalizedCmd.startsWith('add ai-module langchain4j')) {
      if (this.hasNode('langchain4j')) {
        response = 'Módulo IA já está instanciado!';
      } else {
        this.addNode({ id: 'langchain4j', type: 'ai', name: 'LangChain4j / LLM', icon: 'lucideNetwork', col: 3, row: 1 });
        this.addFilesToTree('backend', [{ name: 'src', type: 'folder', isOpen: true, children: [{ name: 'AiAssistantService.java', type: 'file' }] }]);
        if (this.hasNode('spring-boot')) this.addEdge('spring-boot', 'langchain4j', 'http');
        response = ['Conectando provedor de LLM via LangChain4j...', 'Modelos prontos para inferência via REST.'].join('\n');
      }
    } else if (normalizedCmd.startsWith('add service ')) {
      const name = rawCmd.substring(12).trim();
      if (!name) { response = 'Erro: Especifique o nome do serviço.'; isError = true; }
      else if (this.hasNode(name)) { response = `Serviço ${name} já existe!`; isError = true; }
      else if (!this.hasNode('rabbitmq')) {
        response = 'Erro: Suba o RabbitMQ primeiro para orquestrar os serviços dinâmicos.';
        isError = true;
      } else {
        // Encontrar slot disponível no grid 6x4
        let newCol = 5 + Math.floor(Math.random() * 2); // 5 ou 6
        let newRow = 2 + Math.floor(Math.random() * 3); // 2, 3 ou 4

        this.addNode({ id: name, type: 'microservice', name: name, icon: 'lucideCoffee', col: newCol, row: newRow });
        this.addEdge('rabbitmq', name, 'amqp');
        this.addFilesToTree(name, [{ name: 'pom.xml', type: 'file' }]);
        response = `Serviço ${name} instanciado e conectado ao RabbitMQ!`;
      }
    } else if (normalizedCmd.startsWith('add database ')) {
      const parts = rawCmd.split(' ').filter(p => p);
      if (parts.length < 5) {
        response = 'Uso: add database <tipo> <nome-db> <target-service>\nExemplo: add database postgres db-pagamentos ms-pagamentos';
        isError = true;
      } else {
        const type = parts[2];
        const dbName = parts[3];
        const targetService = parts[4];

        if (!this.hasNode(targetService)) {
          response = `Erro: Target service '${targetService}' não encontrado.`;
          isError = true;
        } else {
          let icon = 'simplePostgresql';
          if (type.includes('mongo')) icon = 'simpleMongodb';
          else if (type.includes('mysql')) icon = 'simpleMysql';

          const targetNode = this.activeNodesSignal().find(n => n.id === targetService);
          const newCol = targetNode && targetNode.col < 6 ? targetNode.col + 1 : 6;
          const newRow = targetNode && targetNode.row < 4 ? targetNode.row + 1 : 4;

          this.addNode({ id: dbName, type: 'database', name: dbName, icon, col: newCol, row: newRow });
          this.addEdge(targetService, dbName, 'tcp');
          response = `Database ${dbName} (${type}) criado e acoplado ao ${targetService} via TCP!`;
        }
      }
    } else if (normalizedCmd === 'deploy all') {
      this.activeNodesSignal.set([
        { id: 'angular', type: 'frontend', name: 'Storefront', icon: 'simpleAngular', col: 1, row: 2 },
        { id: 'nginx', type: 'gateway', name: 'API Gateway', icon: 'simpleNginx', col: 2, row: 2 },
        { id: 'spring-boot', type: 'backend', name: 'Order Orchestrator', icon: 'simpleSpringboot', col: 3, row: 2 },
        { id: 'postgresql', type: 'database', name: 'Core DB', icon: 'simplePostgresql', col: 3, row: 3 },
        { id: 'mongodb', type: 'database', name: 'Catalog DB', icon: 'simpleMongodb', col: 3, row: 4 },
        { id: 'langchain4j', type: 'ai', name: 'AI Recommendations', icon: 'lucideNetwork', col: 3, row: 1 },
        { id: 'kafka', type: 'messaging', name: 'Event Bus', icon: 'simpleApachekafka', col: 4, row: 2 },
        { id: 'ms-pedidos', type: 'microservice', name: 'ms-pedidos', icon: 'lucideCoffee', col: 5, row: 1 },
        { id: 'ms-pagamentos', type: 'microservice', name: 'ms-pagamentos', icon: 'lucideCoffee', col: 5, row: 2 },
        { id: 'ms-estoque', type: 'microservice', name: 'ms-estoque', icon: 'lucideCoffee', col: 5, row: 3 },
        { id: 'ms-notificacoes', type: 'microservice', name: 'ms-notificacoes', icon: 'lucideCoffee', col: 5, row: 4 },
        { id: 'pg-pedidos', type: 'database', name: 'pg-pedidos', icon: 'simplePostgresql', col: 6, row: 1 },
        { id: 'pg-pagamentos', type: 'database', name: 'pg-pagamentos', icon: 'simplePostgresql', col: 6, row: 2 },
        { id: 'mongo-estoque', type: 'database', name: 'mongo-estoque', icon: 'simpleMongodb', col: 6, row: 3 },
        { id: 'mongo-notif', type: 'database', name: 'mongo-notif', icon: 'simpleMongodb', col: 6, row: 4 }
      ]);
      this.activeEdgesSignal.set([
        { id: 'angular-nginx', sourceId: 'angular', targetId: 'nginx', protocol: 'http' },
        { id: 'nginx-spring-boot', sourceId: 'nginx', targetId: 'spring-boot', protocol: 'http' },
        { id: 'spring-boot-postgresql', sourceId: 'spring-boot', targetId: 'postgresql', protocol: 'tcp' },
        { id: 'spring-boot-mongodb', sourceId: 'spring-boot', targetId: 'mongodb', protocol: 'tcp' },
        { id: 'spring-boot-langchain4j', sourceId: 'spring-boot', targetId: 'langchain4j', protocol: 'http' },
        { id: 'spring-boot-kafka', sourceId: 'spring-boot', targetId: 'kafka', protocol: 'tcp' },
        { id: 'kafka-ms-pedidos', sourceId: 'kafka', targetId: 'ms-pedidos', protocol: 'tcp' },
        { id: 'kafka-ms-pagamentos', sourceId: 'kafka', targetId: 'ms-pagamentos', protocol: 'tcp' },
        { id: 'kafka-ms-estoque', sourceId: 'kafka', targetId: 'ms-estoque', protocol: 'tcp' },
        { id: 'kafka-ms-notificacoes', sourceId: 'kafka', targetId: 'ms-notificacoes', protocol: 'tcp' },
        { id: 'ms-pedidos-pg-pedidos', sourceId: 'ms-pedidos', targetId: 'pg-pedidos', protocol: 'tcp' },
        { id: 'ms-pagamentos-pg-pagamentos', sourceId: 'ms-pagamentos', targetId: 'pg-pagamentos', protocol: 'tcp' },
        { id: 'ms-estoque-mongo-estoque', sourceId: 'ms-estoque', targetId: 'mongo-estoque', protocol: 'tcp' },
        { id: 'ms-notificacoes-mongo-notif', sourceId: 'ms-notificacoes', targetId: 'mongo-notif', protocol: 'tcp' }
      ]);
      this.fileTreeSignal.set([
        { name: 'README.md', type: 'file' },
        { name: 'frontend', type: 'folder', isOpen: true, children: [{ name: 'package.json', type: 'file' }, { name: 'src', type: 'folder', isOpen: false, children: [] }] },
        { name: 'gateway', type: 'folder', isOpen: false, children: [{ name: 'nginx.conf', type: 'file' }] },
        { name: 'order-orchestrator', type: 'folder', isOpen: true, children: [{ name: 'pom.xml', type: 'file' }, { name: 'src', type: 'folder', isOpen: false, children: [] }] },
        { name: 'ms-pedidos', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
        { name: 'ms-pagamentos', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
        { name: 'ms-estoque', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
        { name: 'ms-notificacoes', type: 'folder', isOpen: false, children: [{ name: 'pom.xml', type: 'file' }] },
        { name: 'infra', type: 'folder', isOpen: true, children: [{ name: 'docker-compose.yml', type: 'file' }, { name: 'k8s', type: 'folder', isOpen: false, children: [] }] }
      ]);
      response = [
        'Executando pipeline de CI/CD via GitHub Actions...',
        'Provisionando instâncias via Terraform...',
        'Orquestrando 16 containers via Kubernetes...',
        'Deploy Concluído! Plataforma e-commerce operacional.'
      ].join('\n');
    } else {
      response = "Comando não reconhecido: " + rawCmd + "\nDigite 'help' para ver os comandos disponíveis.";
      isError = true;
    }

    this.terminalHistorySignal.update(h => [...h, { command: rawCmd, response, isError }]);
  }

  private hasNode(id: string): boolean {
    return this.activeNodesSignal().some(n => n.id === id);
  }

  private addNode(node: ArchitectureNode) {
    this.activeNodesSignal.update(nodes => [...nodes, node]);
  }

  private addEdge(sourceId: string, targetId: string, protocol: 'http' | 'amqp' | 'tcp') {
    const id = sourceId + '-' + targetId;
    if (!this.activeEdgesSignal().some(e => e.id === id)) {
      this.activeEdgesSignal.update(edges => [...edges, { id, sourceId, targetId, protocol }]);
    }
  }

  private addFilesToTree(folderName: string, files: FileNode[]) {
    this.fileTreeSignal.update(tree => {
      const existingFolder = tree.find(node => node.name === folderName && node.type === 'folder');
      if (existingFolder) {
        existingFolder.children = [...(existingFolder.children || []), ...files];
        return [...tree];
      } else {
        return [...tree, { name: folderName, type: 'folder', isOpen: true, children: files }];
      }
    });
  }

  toggleFolder(folderName: string) {
    this.fileTreeSignal.update(tree => {
      const toggleRecursive = (nodes: FileNode[]) => {
        for (const node of nodes) {
          if (node.name === folderName && node.type === 'folder') {
            node.isOpen = !node.isOpen;
            return true;
          }
          if (node.children && toggleRecursive(node.children)) {
            return true;
          }
        }
        return false;
      };

      const newTree = JSON.parse(JSON.stringify(tree));
      toggleRecursive(newTree);
      return newTree;
    });
  }
}
