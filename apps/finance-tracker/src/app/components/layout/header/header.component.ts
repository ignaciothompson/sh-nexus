import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentDate = new Date();
  pageTitle = 'Buenas noches';

  constructor(private router: Router) {
    this.updateTitle(this.router.url);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects);
    });
  }

  ngOnInit() {}

  updateTitle(url: string) {
    if (url.includes('/spending')) this.pageTitle = 'Análisis Financiero';
    else if (url.includes('/transactions')) this.pageTitle = 'Gestión de Efectivo';
    else if (url.includes('/investments')) this.pageTitle = 'Inversiones';
    else if (url.includes('/dashboard')) this.pageTitle = 'Dashboard';
    else this.pageTitle = this.getGreeting();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getFormattedDate(): string {
    return this.currentDate.toLocaleDateString('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
