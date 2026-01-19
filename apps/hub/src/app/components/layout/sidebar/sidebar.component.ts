import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeRoute: string = 'home';
  @Output() navigate = new EventEmitter<string>();
  @Output() openSettings = new EventEmitter<void>();

  navItems: NavItem[] = [
    { icon: 'home', label: 'Home', route: 'home', active: true },
    { icon: 'router', label: 'Network', route: 'network' },
    { icon: 'smart_display', label: 'Media', route: 'media' },
    { icon: 'calendar_month', label: 'Calendar', route: 'calendar' },
    { icon: 'edit_note', label: 'Notes/Planner', route: 'notes' },
    { icon: 'code', label: 'Code', route: 'code' }
  ];

  onNavClick(route: string) {
    this.navigate.emit(route);
  }

  onSettingsClick() {
    this.openSettings.emit();
  }
}
