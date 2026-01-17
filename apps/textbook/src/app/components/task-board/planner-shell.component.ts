import { Component } from '@angular/core';
import { PlannerSidebarComponent } from './planner-sidebar/planner-sidebar.component';
import { TaskBoardComponent } from './task-board.component';

@Component({
  selector: 'app-planner-shell',
  standalone: true,
  imports: [PlannerSidebarComponent, TaskBoardComponent],
  templateUrl: './planner-shell.component.html',
  styleUrls: ['./planner-shell.component.css']
})
export class PlannerShellComponent {}
