import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { PlannerItem, PlannerProject } from '../models/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {
  private itemsSubject = new BehaviorSubject<PlannerItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  private projectsSubject = new BehaviorSubject<PlannerProject[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  private currentProjectSubject = new BehaviorSubject<PlannerProject | null>(null);
  public currentProject$ = this.currentProjectSubject.asObservable();

  constructor(private pb: PocketbaseService) {
    this.loadProjects();
    this.loadItems();
  }

  // Projects
  async loadProjects(): Promise<void> {
    try {
      const projects = await this.pb.client.collection('planner_projects').getFullList<PlannerProject>({
        sort: '-created'
      });
      this.projectsSubject.next(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
      this.projectsSubject.next([]);
    }
  }

  async createProject(data: { name: string; icon?: string; color?: string }): Promise<PlannerProject> {
    try {
      const project = await this.pb.client.collection('planner_projects').create<PlannerProject>(data);
      await this.loadProjects();
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<PlannerProject>): Promise<PlannerProject> {
    try {
      const project = await this.pb.client.collection('planner_projects').update<PlannerProject>(id, data);
      await this.loadProjects();
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      await this.pb.client.collection('planner_projects').delete(id);
      await this.loadProjects();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Items
  async loadItems(projectId?: string): Promise<void> {
    try {
      const filter = projectId ? `project = "${projectId}"` : '';
      const items = await this.pb.client.collection('planner_items').getFullList<PlannerItem>({
        sort: 'order,created',
        filter: filter,
        expand: 'project'
      });
      this.itemsSubject.next(items);
    } catch (error) {
      console.error('Error loading items:', error);
      this.itemsSubject.next([]);
    }
  }

  async createItem(data: Partial<PlannerItem>): Promise<PlannerItem> {
    try {
      const item = await this.pb.client.collection('planner_items').create<PlannerItem>({
        ...data,
        order: data.order || 0,
        status: data.status || 'pending',
        card_type: data.card_type || 'text'
      });
      await this.loadItems();
      return item;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async updateItem(id: string, data: Partial<PlannerItem>): Promise<PlannerItem> {
    try {
      const item = await this.pb.client.collection('planner_items').update<PlannerItem>(id, data);
      await this.loadItems();
      return item;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<boolean> {
    try {
      await this.pb.client.collection('planner_items').delete(id);
      await this.loadItems();
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }

  async updateItemStatus(id: string, status: PlannerItem['status']): Promise<void> {
    try {
      await this.pb.client.collection('planner_items').update(id, { status });
      await this.loadItems();
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  }

  setCurrentProject(project: PlannerProject | null): void {
    this.currentProjectSubject.next(project);
    if (project) {
      this.loadItems(project.id);
    } else {
      this.loadItems();
    }
  }
}
