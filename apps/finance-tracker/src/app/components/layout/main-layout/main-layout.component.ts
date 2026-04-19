import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  activeRoute = 'dashboard';
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.activeRoute = this.router.url.split('/')[1] || 'dashboard';
  }
  
  onNavigate(route: string) {
    this.activeRoute = route;
    this.router.navigate([route]);
  }
}
