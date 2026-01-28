import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private dialogService = inject(DialogService);

  openSettings() {
    // Settings modal will be implemented later
    console.log('Open settings');
  }
}
