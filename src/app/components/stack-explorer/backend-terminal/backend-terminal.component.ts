import { Component, ElementRef, ViewChild, inject, signal, effect, afterNextRender, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { ArchitectureSimulatorService, ArchitectureNode } from '../../../services/architecture-simulator.service';
import gsap from 'gsap';

@Component({
  selector: 'app-backend-terminal',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="bg-[#11131a]/95 backdrop-blur-2xl border border-[var(--border-line)] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] h-[75vh] min-h-[500px] flex flex-col md:flex-row overflow-hidden relative w-full">
      
      <!-- Left Sidebar (File Explorer) -->
      <div class="hidden md:flex w-64 bg-black/40 border-r border-[var(--border-line)]/50 flex-col z-20">
        <div class="px-4 py-3 text-xs font-bold text-[var(--text-muted)] tracking-wider flex items-center justify-between uppercase">
          Explorer
          <ng-icon name="lucideMoreHorizontal" size="16"></ng-icon>
        </div>
        
        <div class="flex-1 overflow-y-auto py-2">
          <div class="px-4 py-1 text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 cursor-pointer">
            <ng-icon name="lucideChevronDown" size="16"></ng-icon>
            PORTFOLIO-ARCHITECTURE
          </div>
          
          <div class="mt-1 flex flex-col gap-1">
            @for (item of simulator.fileTree(); track item.name) {
              <div class="px-8 py-1.5 text-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] cursor-pointer flex items-center gap-2 transition-colors">
                <ng-icon [name]="item.type === 'folder' ? (item.isOpen ? 'lucideFolderOpen' : 'lucideFolder') : 'lucideFileCode'" size="16"
                         [class]="item.type === 'folder' ? 'text-[var(--accent-backend)]' : 'text-blue-400'"></ng-icon>
                {{ item.name }}
              </div>
              @if (item.type === 'folder' && item.isOpen && item.children) {
                @for (child of item.children; track child.name) {
                  <div class="px-12 py-1.5 text-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] cursor-pointer flex items-center gap-2 transition-colors">
                    <ng-icon name="lucideFileText" size="14" class="text-gray-400"></ng-icon>
                    {{ child.name }}
                  </div>
                }
              }
            }
          </div>
        </div>
      </div>

      <!-- Main Area (Canvas + Terminal) -->
      <div class="flex-1 flex flex-col h-full w-full z-10">
        

        <!-- Top Canvas (Simulation Visuals) -->
        <div #canvasViewport 
             class="flex-1 min-h-[450px] relative overflow-hidden cursor-grab active:cursor-grabbing canvas-viewport select-none"
             (wheel)="onCanvasWheel($event)"
             (mousedown)="onCanvasPanStart($event)"
             (mousemove)="onCanvasPanMove($event)"
             (mouseup)="onCanvasPanEnd()"
             (mouseleave)="onCanvasPanEnd()">
          
          <!-- Space Background Layers -->
          <div class="absolute inset-0 space-bg z-0"></div>
          <div class="absolute inset-0 starfield-layer z-0"></div>
          <div class="absolute inset-0 nebula-layer z-0"></div>

          <!-- Zoom Controls HUD -->
          <div class="absolute top-3 right-3 z-40 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 text-xs text-[var(--text-muted)] font-mono">
            <button (click)="zoomIn()" class="hover:text-white transition-colors px-1">+</button>
            <span>{{ (canvasScale() * 100).toFixed(0) }}%</span>
            <button (click)="zoomOut()" class="hover:text-white transition-colors px-1">&minus;</button>
            <button (click)="resetView()" class="hover:text-white transition-colors ml-1 text-[10px] border border-white/20 rounded px-1.5 py-0.5">Reset</button>
          </div>

          @if (simulator.activeNodes().length === 0) {
            <div class="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] font-mono text-sm text-center z-30">
              <div>
                Aguardando infraestrutura...
              </div>
            </div>
          }

          <!-- Zoomable / Pannable Inner World -->
          <div #canvasWorld class="absolute inset-0 origin-center transition-transform duration-100 ease-out"
               [style.transform]="'scale(' + canvasScale() + ') translate(' + canvasPanX() + 'px, ' + canvasPanY() + 'px)'">

            <!-- Background Wires Layer -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
              <defs>
                @for (edge of simulator.activeEdges(); track edge.id + '-grad') {
                  <linearGradient [attr.id]="'fade-' + edge.id"
                    [attr.x1]="getEdgeCoords(edge).x1"
                    [attr.y1]="getEdgeCoords(edge).y1"
                    [attr.x2]="getEdgeCoords(edge).x2"
                    [attr.y2]="getEdgeCoords(edge).y2"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
                    <stop offset="20%" stop-color="currentColor" stop-opacity="1" />
                    <stop offset="80%" stop-color="currentColor" stop-opacity="1" />
                    <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
                  </linearGradient>
                }
              </defs>

              <!-- Fios base (apagados) com fade -->
              @for (edge of simulator.activeEdges(); track edge.id + '-base') {
                <line 
                  [attr.x1]="getEdgeCoords(edge).x1" 
                  [attr.y1]="getEdgeCoords(edge).y1" 
                  [attr.x2]="getEdgeCoords(edge).x2" 
                  [attr.y2]="getEdgeCoords(edge).y2" 
                  stroke="#1a1a2e"
                  stroke-width="0.5" 
                  opacity="0.4" />
              }
              
              <!-- Fluxo de dados animado sobreposto com fade nas pontas -->
              @for (edge of simulator.activeEdges(); track edge.id) {
                <line 
                  [attr.x1]="getEdgeCoords(edge).x1" 
                  [attr.y1]="getEdgeCoords(edge).y1" 
                  [attr.x2]="getEdgeCoords(edge).x2" 
                  [attr.y2]="getEdgeCoords(edge).y2" 
                  [attr.stroke]="'url(#fade-' + edge.id + ')'"
                  [ngClass]="{
                    'path-http': edge.protocol === 'http',
                    'path-amqp': edge.protocol === 'amqp',
                    'path-tcp': edge.protocol === 'tcp'
                  }"
                  [style.color]="edge.protocol === 'http' ? '#DD0031' : edge.protocol === 'amqp' ? '#FF6600' : '#4169E1'"
                  class="transition-all duration-500"
                  stroke-width="0.75" />
              }
            </svg>

            <!-- GPU Accelerated HTML Payload Orb -->
            <div #pingPayload class="absolute hidden pointer-events-none z-30 flex items-center justify-center" style="top: 0; left: 0; transform: translate(-50%, -50%);">
              <div class="absolute inset-[-4px] rounded-full animate-ping opacity-30 bg-current" [ngClass]="payloadColor()"></div>
              <div class="relative z-10 flex items-center justify-center rounded-full bg-[#0a0c14] p-1.5 border shadow-[0_0_20px_currentColor,0_0_40px_currentColor] transition-colors duration-300" [ngClass]="payloadColor()" [style.borderColor]="'currentColor'">
                <ng-icon [name]="payloadIcon()" size="16"></ng-icon>
              </div>
            </div>

            <!-- CSS Grid for Nodes -->
            <div class="relative w-full h-full grid grid-cols-6 grid-rows-4 gap-4 p-8 z-10">
              @for (node of simulator.activeNodes(); track node.id) {
                <div [attr.id]="'node-' + node.id" 
                     class="flex flex-col items-center justify-center gap-2 animate-bounce-in node-perspective" 
                     [style.grid-column]="node.col" 
                     [style.grid-row]="node.row">
                  <!-- 3D Card Shell -->
                  <div class="node-card relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
                       [ngClass]="{
                         'node-frontend': node.type === 'frontend',
                         'node-backend': node.type === 'backend',
                         'node-database': node.type === 'database' && !node.id.includes('mongo'),
                         'node-mongo': node.id.includes('mongo'),
                         'node-messaging': node.type === 'messaging',
                         'node-microservice': node.type === 'microservice',
                         'node-ai': node.type === 'ai',
                         'node-gateway': node.type === 'gateway'
                       }">
                    <!-- Icon -->
                    <ng-icon [name]="node.icon" size="40" class="relative z-10 drop-shadow-[0_0_12px_currentColor]"></ng-icon>
                  </div>
                  <span class="text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded text-[var(--text-primary)] text-center whitespace-nowrap">
                    {{ node.name }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Animated Terminal Hint Overlay (Moved to IDE bottom right) -->
          @if (currentInput() === '') {
            <div class="absolute bottom-4 right-4 pointer-events-none flex flex-col items-end z-30 transition-opacity duration-300">
              <div class="bg-[var(--accent-backend)]/10 border border-[var(--accent-backend)]/30 backdrop-blur-sm px-3 py-2 rounded shadow-[0_0_15px_rgba(109,179,63,0.15)] flex items-center gap-2">
                <ng-icon name="lucideTerminal" size="14" class="text-[var(--accent-backend)] animate-pulse"></ng-icon>
                <span class="text-xs text-[#ABB2BF] font-mono">{{ currentHint() }}</span>
                <span class="w-1.5 h-3 bg-[var(--accent-backend)] animate-pulse inline-block"></span>
              </div>
            </div>
          }
        </div>

        <!-- Bottom Terminal -->
        <div class="h-48 md:h-56 bg-black/60 backdrop-blur-md z-20 border-t border-[var(--border-line)]/50 p-4 font-mono text-xs md:text-sm flex flex-col shrink-0" (click)="focusInput()">
          <div class="flex gap-2 mb-2 shrink-0">
            <span class="text-xs text-[var(--text-muted)] uppercase tracking-wider">Terminal Integrated</span>
          </div>

          <div class="flex-1 overflow-y-auto mb-2 scrollbar-hide flex flex-col gap-2 min-h-0">
            @for (item of simulator.terminalHistory(); track $index) {
              <div>
                <div class="flex items-center text-[var(--text-muted)] mb-1">
                  <span class="text-[#6DB33F] mr-2">rafael@devops:~/portfolio$</span>
                  <span>{{ item.command }}</span>
                </div>
                <div class="whitespace-pre-wrap leading-relaxed" 
                     [class.text-[#E06C75]]="item.isError"
                     [class.text-[#ABB2BF]]="!item.isError"
                     [class.text-[#E5C07B]]="item.command === 'teste' && !item.isError">
                  {{ item.response }}
                </div>
              </div>
            }
          </div>

          <div class="flex items-center text-[#6DB33F] mt-auto pt-2 shrink-0 relative">
            <span class="mr-2 hidden md:inline">rafael@devops:~/portfolio$</span>
            <span class="mr-2 md:hidden">~$</span>
            <input 
              #commandInput
              type="text" 
              [value]="currentInput()"
              (input)="currentInput.set(commandInput.value)"
              (keydown.enter)="executeCommand()"
              (keydown.tab)="handleTab($event)"
              class="flex-1 bg-transparent outline-none border-none text-[#ABB2BF] font-bold placeholder-[var(--text-muted)]/30 transition-all focus:placeholder-transparent"
              placeholder="Digite um comando (ex: help)..."
              autocomplete="off"
              spellcheck="false">
          </div>
        </div>
        
      </div>
    </div>

    <!-- Recursive File Tree Template -->
    <ng-template #fileTreeTemplate let-nodes>
      <div class="pl-2 space-y-1">
        @for (node of nodes; track node.name) {
          <div>
            @if (node.type === 'folder') {
              <div class="flex items-center gap-2 py-1 px-2 hover:bg-[#2c2c2c] rounded cursor-pointer transition-colors text-[var(--text-primary)]"
                   (click)="toggleFolder(node.name)">
                <ng-icon [name]="node.isOpen ? 'lucideChevronDown' : 'lucideChevronRight'" size="16"></ng-icon>
                <span class="truncate">{{ node.name }}</span>
              </div>
              @if (node.isOpen && node.children) {
                <ng-container *ngTemplateOutlet="fileTreeTemplate; context: { $implicit: node.children }"></ng-container>
              }
            }
            @if (node.type === 'file') {
              <div class="flex items-center gap-2 py-1 px-2 pl-6 hover:bg-[#2c2c2c] rounded transition-colors text-[var(--text-muted)]">
                <ng-icon name="lucideTerminal" size="14" class="opacity-50 shrink-0"></ng-icon>
                <span class="truncate">{{ node.name }}</span>
              </div>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .animate-bounce-in {
      animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }

    /* === SPACE BACKGROUND === */
    .space-bg {
      background: radial-gradient(ellipse at 20% 50%, #0d0221 0%, #060612 40%, #000000 100%);
    }

    .nebula-layer {
      background: 
        radial-gradient(ellipse at 70% 30%, rgba(138, 99, 244, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 20% 70%, rgba(0, 229, 255, 0.04) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(221, 0, 49, 0.03) 0%, transparent 40%);
      animation: nebulaShift 20s ease-in-out infinite alternate;
    }
    @keyframes nebulaShift {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.7; }
    }

    .starfield-layer {
      background-image:
        radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
        radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 40% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
        radial-gradient(1px 1px at 55% 70%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 70% 35%, rgba(255,255,255,0.6) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 85% 60%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 30% 65%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 65% 10%, rgba(255,255,255,0.6) 0%, transparent 100%),
        radial-gradient(1px 1px at 78% 88%, rgba(255,255,255,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 92% 25%, rgba(255,255,255,0.45) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 8% 55%, rgba(138,99,244,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 45% 92%, rgba(0,229,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 60% 40%, rgba(255,255,255,0.3) 0%, transparent 100%);
      animation: starTwinkle 4s ease-in-out infinite alternate;
    }
    @keyframes starTwinkle {
      0% { opacity: 0.7; }
      50% { opacity: 1; }
      100% { opacity: 0.8; }
    }

    .node-perspective {
      perspective: 600px;
    }

    .node-card {
      border: none;
      background: transparent;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
      transform: translateZ(0) rotateX(0deg) rotateY(0deg);
      transform-style: preserve-3d;
    }
    .node-card:hover {
      transform: translateZ(12px) rotateX(-4deg) rotateY(4deg) scale(1.15);
      filter: brightness(1.3);
    }

    /* Per-type colored glow and text color */
    .node-frontend { color: #DD0031; filter: drop-shadow(0 0 10px rgba(221,0,49,0.15)); }
    .node-backend  { color: #6DB33F; filter: drop-shadow(0 0 10px rgba(109,179,63,0.15)); }
    .node-database { color: #4169E1; filter: drop-shadow(0 0 10px rgba(65,105,225,0.15)); }
    .node-mongo    { color: #47A248; filter: drop-shadow(0 0 10px rgba(71,162,72,0.15)); }
    .node-messaging { color: #FF6600; filter: drop-shadow(0 0 10px rgba(255,102,0,0.15)); }
    .node-microservice { color: #8a63f4; filter: drop-shadow(0 0 10px rgba(138,99,244,0.15)); }
    .node-ai { color: #00E5FF; filter: drop-shadow(0 0 10px rgba(0,229,255,0.15)); }
    .node-gateway { color: #009639; filter: drop-shadow(0 0 10px rgba(0,150,57,0.15)); }

    .canvas-viewport {
      touch-action: none;
    }
    
    /* High Performance Protocol CSS Animations */
    @keyframes dashHttp { to { stroke-dashoffset: -36; } }
    @keyframes dashAmqp { to { stroke-dashoffset: -56; } }
    @keyframes pulseTcp { 
      0% { opacity: 0.3; } 
      50% { opacity: 1; } 
      100% { opacity: 0.3; } 
    }

    .path-http { 
      stroke-dasharray: 6, 12; 
      stroke-linecap: round;
      animation: dashHttp 0.4s linear infinite;
    }
    .path-amqp { 
      stroke-dasharray: 8, 20; 
      stroke-linecap: round;
      animation: dashAmqp 1.2s linear infinite;
    }
    .path-tcp { 
      stroke-width: 3; 
      animation: pulseTcp 2s ease-in-out infinite;
    }
    `
  ]
})
export class BackendTerminalComponent {
  simulator = inject(ArchitectureSimulatorService);
  currentInput = signal('');
  payloadIcon = signal<string>('lucideGlobe');
  payloadColor = signal<string>('text-white');

  // Pan & Zoom state
  canvasScale = signal(1);
  canvasPanX = signal(0);
  canvasPanY = signal(0);
  private isPanning = false;
  panStartX = 0; panStartY = 0;
  panOriginX = 0; panOriginY = 0;

  // Animated Hints State
  currentHint = signal<string>('');
  private hints = [
    'Interaja com o terminal para criar arquiteturas dinâmicas!',
    'Tente limpar a tela com o comando: clear',
    'Crie um microsserviço: add service ms-auth',
    'Acople um banco de dados: add database postgres db-auth ms-auth',
    'Dispare o fluxo de dados: teste',
    'Restaure a arquitetura enterprise: deploy all'
  ];
  private hintIndex = 0;
  private typewriterInterval: any;
  private hintLoopInterval: any;

  @ViewChild('commandInput') commandInput!: ElementRef<HTMLInputElement>;
  @ViewChild('svgLayer') svgLayer!: ElementRef<SVGSVGElement>;
  @ViewChild('canvasViewport') canvasViewport!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasWorld') canvasWorld!: ElementRef<HTMLDivElement>;
  @ViewChild('pingPayload') pingPayload!: ElementRef<HTMLDivElement>;

  constructor() {
    afterNextRender(() => {
      // Start the first hint immediately
      this.typewriterEffect(this.hints[this.hintIndex]);
      
      // Loop the hints every 6 seconds
      this.hintLoopInterval = setInterval(() => {
        this.hintIndex = (this.hintIndex + 1) % this.hints.length;
        this.typewriterEffect(this.hints[this.hintIndex]);
      }, 6000);
    });

    effect(() => {
      const pingCount = this.simulator.triggerPing();
      if (pingCount > 0) {
        this.runPingAnimation();
      }
    });
  }

  focusInput() {
    this.commandInput?.nativeElement.focus();
  }

  executeCommand() {
    this.simulator.executeCommand(this.currentInput());
    this.currentInput.set('');
    this.scrollToBottom();
  }

  handleTab(event: Event) {
    event.preventDefault();
    const input = this.currentInput().toLowerCase();
    if (!input) return;

    const availableCommands = this.simulator.getAvailableCommands();
    const match = availableCommands.find(cmd => cmd.startsWith(input));

    if (match) {
      this.currentInput.set(match);
    }
  }

  toggleFolder(folderName: string) {
    this.simulator.toggleFolder(folderName);
  }

  getNode(id: string): ArchitectureNode | undefined {
    return this.simulator.activeNodes().find(n => n.id === id);
  }

  private typewriterEffect(text: string) {
    let i = 0;
    this.currentHint.set('');
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    
    this.typewriterInterval = setInterval(() => {
      this.currentHint.update(val => val + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(this.typewriterInterval);
    }, 45); // Typing speed
  }

  ngOnDestroy() {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    if (this.hintLoopInterval) clearInterval(this.hintLoopInterval);
  }

  private colNum(col?: number): number {
    if (!col) return 0;
    return (col - 1) * 16.66 + 8.33;
  }

  private rowNum(row?: number): number {
    if (!row) return 0;
    return (row - 1) * 25 + 12.5;
  }

  getColPercent(col?: number): string {
    return this.colNum(col) + '%';
  }

  getRowPercent(row?: number): string {
    return this.rowNum(row) + '%';
  }

  /** Returns shortened line coords so lines stop before reaching icon centers */
  getEdgeCoords(edge: any): { x1: string, y1: string, x2: string, y2: string } {
    const src = this.getNode(edge.sourceId);
    const tgt = this.getNode(edge.targetId);
    const x1 = this.colNum(src?.col);
    const y1 = this.rowNum(src?.row);
    const x2 = this.colNum(tgt?.col);
    const y2 = this.rowNum(tgt?.row);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len === 0) return { x1: x1 + '%', y1: y1 + '%', x2: x2 + '%', y2: y2 + '%' };

    const offset = 4.5; // percentage units to pull inward from each end
    const nx = (dx / len) * offset;
    const ny = (dy / len) * offset;

    return {
      x1: (x1 + nx) + '%',
      y1: (y1 + ny) + '%',
      x2: (x2 - nx) + '%',
      y2: (y2 - ny) + '%'
    };
  }

  // === Pan & Zoom Controls ===
  onCanvasWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    const newScale = Math.max(0.4, Math.min(2.5, this.canvasScale() + delta));
    this.canvasScale.set(newScale);
  }

  onCanvasPanStart(event: MouseEvent) {
    if (event.button !== 0) return; // left click only
    this.isPanning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panOriginX = this.canvasPanX();
    this.panOriginY = this.canvasPanY();
  }

  onCanvasPanMove(event: MouseEvent) {
    if (!this.isPanning) return;
    const dx = (event.clientX - this.panStartX) / this.canvasScale();
    const dy = (event.clientY - this.panStartY) / this.canvasScale();
    this.canvasPanX.set(this.panOriginX + dx);
    this.canvasPanY.set(this.panOriginY + dy);
  }

  onCanvasPanEnd() {
    this.isPanning = false;
  }

  zoomIn() {
    this.canvasScale.set(Math.min(2.5, this.canvasScale() + 0.15));
  }

  zoomOut() {
    this.canvasScale.set(Math.max(0.4, this.canvasScale() - 0.15));
  }

  resetView() {
    this.canvasScale.set(1);
    this.canvasPanX.set(0);
    this.canvasPanY.set(0);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const terminal = this.commandInput.nativeElement.closest('.h-48, .md\\:h-56')?.querySelector('.overflow-y-auto');
      if (terminal) terminal.scrollTop = terminal.scrollHeight;
    }, 10);
  }

  private getEdgeProtocol(id1: string, id2: string): 'http' | 'amqp' | 'tcp' {
    const edge = this.simulator.activeEdges().find(e =>
      (e.sourceId === id1 && e.targetId === id2) ||
      (e.sourceId === id2 && e.targetId === id1)
    );
    return edge?.protocol || 'http';
  }

  private runPingAnimation() {
    const payloadTemplate = this.pingPayload?.nativeElement;
    if (!payloadTemplate) return;

    const angularNode = this.getNode('angular');
    const nginxNode = this.getNode('nginx');
    const springNode = this.getNode('spring-boot');
    const dbNode = this.getNode('postgresql') || this.getNode('mongodb');
    const mqNode = this.getNode('rabbitmq') || this.getNode('kafka');

    if (!angularNode || !springNode) return;

    // We'll create a factory for temporary payload elements
    const createPayload = () => {
      const clone = payloadTemplate.cloneNode(true) as HTMLElement;
      if (payloadTemplate.parentElement) {
        payloadTemplate.parentElement.appendChild(clone);
      }
      clone.style.display = 'flex';
      clone.style.opacity = '1';
      return clone;
    };

    const removePayload = (el: HTMLElement) => {
      if (el && el.parentElement) {
        el.parentElement.removeChild(el);
      }
    };

    const mainPayload = createPayload();
    const tl = gsap.timeline();

    gsap.set(mainPayload, {
      left: this.getColPercent(angularNode.col),
      top: this.getRowPercent(angularNode.row),
    });

    const setPayloadIcon = (el: HTMLElement, protocol: string) => {
      const iconSpan = el.querySelector('ng-icon');
      const innerWrapper = el.querySelector('.relative.z-10') as HTMLElement;
      const outerAura = el.querySelector('.animate-ping') as HTMLElement;

      let colorClass = 'text-[#DD0031]'; // http
      if (protocol === 'tcp') colorClass = 'text-[#4169E1]';
      else if (protocol === 'amqp') colorClass = 'text-[#FF6600]';

      // We'd ideally change the SVG inside ng-icon but for raw DOM cloning,
      // it's easier to just change the color which is the main visual cue.
      if (innerWrapper) {
        innerWrapper.className = `relative z-10 flex items-center justify-center rounded-full bg-[#0a0c14] p-1.5 border shadow-[0_0_20px_currentColor,0_0_40px_currentColor] transition-colors duration-300 ${colorClass}`;
      }
      if (outerAura) {
        outerAura.className = `absolute inset-[-4px] rounded-full animate-ping opacity-30 bg-current ${colorClass}`;
      }
    };

    const routeTo = (timeline: gsap.core.Timeline, el: HTMLElement, sourceNode: any, targetNode: any, pos?: string | number) => {
      timeline.to(el, {
        left: this.getColPercent(targetNode.col),
        top: this.getRowPercent(targetNode.row),
        duration: 0.6,
        ease: 'power2.inOut',
        onStart: () => {
          setPayloadIcon(el, this.getEdgeProtocol(sourceNode.id, targetNode.id));
        },
        onComplete: () => {
          gsap.fromTo('#node-' + targetNode.id,
            { scale: 1, filter: 'brightness(1)' },
            { scale: 1.15, filter: 'brightness(1.5)', duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }
          );
        }
      }, pos);
    };

    const route = [];
    if (nginxNode) route.push(nginxNode);
    route.push(springNode);
    if (dbNode && !mqNode) route.push(dbNode); // Only hit core DB if no MQ, otherwise go to MQ

    let current = angularNode;
    route.forEach(node => {
      routeTo(tl, mainPayload, current, node);
      current = node;
    });

    if (mqNode) {
      // Go to MQ
      routeTo(tl, mainPayload, current, mqNode);
      current = mqNode;

      // FAN-OUT CONCURRENTLY
      const dynamicServices = this.simulator.activeNodes().filter(n => n.type === 'microservice');

      tl.add('fanOutStart'); // Label for concurrent start

      const serviceClones: HTMLElement[] = [];

      dynamicServices.forEach((srv, index) => {
        const srvPayload = createPayload();
        serviceClones.push(srvPayload);
        gsap.set(srvPayload, {
          left: this.getColPercent(mqNode.col),
          top: this.getRowPercent(mqNode.row),
        });

        // Move from MQ to Service (all start at 'fanOutStart')
        routeTo(tl, srvPayload, mqNode, srv, 'fanOutStart');

        // Check if service has database
        const srvEdges = this.simulator.activeEdges().filter(e => e.sourceId === srv.id && e.protocol === 'tcp');
        if (srvEdges.length > 0) {
          const srvDb = this.getNode(srvEdges[0].targetId);
          if (srvDb) {
            routeTo(tl, srvPayload, srv, srvDb, 'fanOutStart+=0.6');
            routeTo(tl, srvPayload, srvDb, srv, 'fanOutStart+=1.2');
            routeTo(tl, srvPayload, srv, mqNode, 'fanOutStart+=1.8');
          } else {
            routeTo(tl, srvPayload, srv, mqNode, 'fanOutStart+=1.2');
          }
        } else {
          routeTo(tl, srvPayload, srv, mqNode, 'fanOutStart+=0.6');
        }
      });

      // Wait for all fan-outs to finish before moving the main payload backward
      const maxFanOutTime = dynamicServices.length > 0 ? (dynamicServices.some(s => this.simulator.activeEdges().some(e => e.sourceId === s.id && e.protocol === 'tcp')) ? 2.4 : 1.2) : 0;

      tl.add('fanOutEnd', `fanOutStart+=${maxFanOutTime}`);

      // Cleanup service clones
      tl.call(() => {
        serviceClones.forEach(clone => removePayload(clone));
      }, [], 'fanOutEnd');

      // Now route the main payload back from MQ to Spring
      routeTo(tl, mainPayload, mqNode, springNode, 'fanOutEnd');
      current = springNode;
    } else if (dbNode) {
      // Reverse from DB if no MQ
      routeTo(tl, mainPayload, dbNode, springNode);
      current = springNode;
    }

    // Backward path to Angular
    const backRoute = [];
    if (nginxNode) backRoute.push(nginxNode);
    backRoute.push(angularNode);

    backRoute.forEach(node => {
      routeTo(tl, mainPayload, current, node);
      current = node;
    });

    tl.to(mainPayload, {
      opacity: 0, duration: 0.3, onComplete: () => {
        removePayload(mainPayload);
      }
    });
  }
}
