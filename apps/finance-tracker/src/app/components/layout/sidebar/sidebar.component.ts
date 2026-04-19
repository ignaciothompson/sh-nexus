import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeRoute: string = 'dashboard';
  @Output() navigate = new EventEmitter<string>();

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: 'dashboard' },
    { icon: 'analytics', label: 'Análisis', route: 'spending' },
    { icon: 'receipt_long', label: 'Efectivo', route: 'transactions' },
    { icon: 'trending_up', label: 'Inversiones', route: 'investments' }
  ];

  onNavClick(route: string) {
    this.navigate.emit(route);
  }
}
