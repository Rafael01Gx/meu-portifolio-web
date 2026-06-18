import { Injectable, signal } from '@angular/core';
import { PROJECTS } from '../data/projects.data';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private projectsSignal = signal<Project[]>(PROJECTS);

  get projects() {
    return this.projectsSignal.asReadonly();
  }
}
