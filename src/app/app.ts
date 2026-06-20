import { Component } from '@angular/core';
import { HeroTerminalComponent } from './components/hero-terminal/hero-terminal.component';
import { StackExplorerComponent } from './components/stack-explorer/stack-explorer.component';
import { ProjectsShowcaseComponent } from './components/projects-showcase/projects-showcase.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { ResumeCta } from './components/resume-cta/resume-cta.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeroTerminalComponent,
    StackExplorerComponent,
    ProjectsShowcaseComponent,
    ResumeCta,
    SiteFooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
