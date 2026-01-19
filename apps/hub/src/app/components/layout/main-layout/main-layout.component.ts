import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { WelcomeComponent } from '../../welcome/welcome.component';
import { SettingsModalComponent } from '../../modals/settings-modal/settings-modal.component';
import { SectionsService } from '../../../services/sections.service';
import { Section } from '../../../models/types';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, WelcomeComponent, SettingsModalComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  showWelcome = false;
  showSettingsModal = false;
  sections: Section[] = [];
  
  constructor(private sectionsService: SectionsService) {}
  
  ngOnInit() {
    this.loadSections();
  }
  
  loadSections() {
    this.sectionsService.getAll().subscribe({
      next: (sections) => this.sections = sections,
      error: (err) => console.error('Failed to load sections', err)
    });
  }
  
  onSetupComplete() {
    this.showWelcome = false;
  }
  
  openSettingsModal() {
    this.showSettingsModal = true;
  }
  
  onSettingsModalClose() {
    this.showSettingsModal = false;
  }
  
  onSectionsUpdated() {
    this.loadSections();
  }
}

