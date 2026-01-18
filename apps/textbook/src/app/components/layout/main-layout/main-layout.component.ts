import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { WelcomeComponent } from '../../welcome/welcome.component';
import { PocketbaseService } from '../../../services/pocketbase.service';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, WelcomeComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  showWelcome = false;
  isInitializing = true;

  constructor(private pb: PocketbaseService) {}

  ngOnInit() {
    this.checkPocketBaseHealth();
  }

  async checkPocketBaseHealth() {
    const isHealthy = await this.pb.checkHealth();
    this.showWelcome = !isHealthy;
    this.isInitializing = false;
  }

  async onSetupComplete() {
    this.isInitializing = true;
    // Wait a bit for user to complete setup
    setTimeout(async () => {
      await this.checkPocketBaseHealth();
    }, 1000);
  }
}
