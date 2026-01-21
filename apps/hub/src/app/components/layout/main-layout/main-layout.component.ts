import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { WelcomeComponent } from '../../welcome/welcome.component';
import { SettingsModalComponent, SettingsDialogData, SettingsDialogResult } from '../../modals/settings-modal/settings-modal.component';
import { SectionsService } from '../../../services/sections.service';
import { DialogService } from '../../../services/dialog.service';
import { Section } from '../../../models/types';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, WelcomeComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  showWelcome = false;
  sections: Section[] = [];
  activeRoute = 'home';
  
  constructor(
    private sectionsService: SectionsService,
    private dialogService: DialogService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadSections();
    // Set active route based on current URL
    this.activeRoute = this.router.url.split('/')[1] || 'home';
  }
  
  loadSections() {
    this.sectionsService.getAll().subscribe({
      next: (sections) => this.sections = sections,
      error: (err) => console.error('Failed to load sections', err)
    });
  }
  
  onNavigate(route: string) {
    this.activeRoute = route;
    this.router.navigate([route]);
  }
  
  onSetupComplete() {
    this.showWelcome = false;
  }
  
  openSettingsModal() {
    const dialogRef = this.dialogService.open<SettingsDialogResult, SettingsDialogData, SettingsModalComponent>(
      SettingsModalComponent,{
        data: { sections: this.sections },
        size: 'xl'
      }
    );

    dialogRef.closed.subscribe(result => {
      if (result?.sectionsUpdated) {
        this.loadSections();
      }
    });
  }
}
