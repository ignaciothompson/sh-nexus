import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '../../../services/planner.service';
import { PlannerProject } from '../../../models/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-planner-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planner-sidebar.component.html',
  styleUrls: ['./planner-sidebar.component.css']
})
export class PlannerSidebarComponent implements OnInit, OnDestroy {
  projects: PlannerProject[] = [];
  selectedProjectId: string | null = null;
  showAddModal = false;
  
  newProject = {
    name: '',
    icon: 'folder',
    color: '#9c33ff'
  };

  icons = [
    { name: 'Folder', value: 'folder' },
    { name: 'Work', value: 'work' },
    { name: 'Home', value: 'home' },
    { name: 'Shopping', value: 'shopping_cart' },
    { name: 'Fitness', value: 'fitness_center' },
    { name: 'Code', value: 'code' },
    { name: 'Design', value: 'palette' },
    { name: 'Star', value: 'star' }
  ];

  colors = [
    { name: 'Purple', value: '#9c33ff' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }
  ];

  private subscription = new Subscription();

  constructor(
    private plannerService: PlannerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.plannerService.projects$.subscribe(projects => {
        this.projects = projects;
        // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();
      })
    );

    this.subscription.add(
      this.plannerService.currentProject$.subscribe(project => {
        this.selectedProjectId = project?.id || null;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  selectAllProjects(): void {
    this.plannerService.setCurrentProject(null);
  }

  selectProject(project: PlannerProject): void {
    this.plannerService.setCurrentProject(project);
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newProject = { name: '', icon: 'folder', color: '#9c33ff' };
  }

  async saveProject(): Promise<void> {
    if (!this.newProject.name.trim()) return;
    
    try {
      await this.plannerService.createProject(this.newProject);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      // Always close modal
      this.closeAddModal();
    }
  }
}
