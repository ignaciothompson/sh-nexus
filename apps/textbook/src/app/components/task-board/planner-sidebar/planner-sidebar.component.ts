import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlannerService } from '../../../services/planner.service';
import { PlannerProject } from '../../../models/types';
import { Subscription } from 'rxjs';
import { PlannerCardCreateModalComponent, NewProjectData } from '../../modals/planner-card-create-modal/planner-card-create-modal.component';

@Component({
  selector: 'app-planner-sidebar',
  standalone: true,
  imports: [CommonModule, PlannerCardCreateModalComponent],
  templateUrl: './planner-sidebar.component.html',
  styleUrls: ['./planner-sidebar.component.css']
})
export class PlannerSidebarComponent implements OnInit, OnDestroy {
  projects: PlannerProject[] = [];
  selectedProjectId: string | null = null;
  showAddModal = false;

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
  }

  async onSaveProject(projectData: NewProjectData): Promise<void> {
    try {
      await this.plannerService.createProject(projectData);
      this.closeAddModal();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }
}
