import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  
  // Upcoming events
  upcomingEvents: CalendarEvent[] = [];

  // Month names
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit() {
    this.generateCalendar();
    this.loadEvents();
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Previous month's trailing days
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    this.calendarDays = [];
    
    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(year, month - 1, prevMonthDays - i),
        hasEvents: false
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = this.isToday(date);
      
      this.calendarDays.push({
        day,
        isCurrentMonth: true,
        isToday,
        date,
        hasEvents: this.hasEventsOnDate(date)
      });
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - this.calendarDays.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(year, month + 1, day),
        hasEvents: false
      });
    }
  }

  loadEvents() {
    // TODO: Integrate with PocketBase or calendar service
    // Placeholder events
    this.upcomingEvents = [
      {
        title: 'Team Meeting',
        date: new Date(2026, 0, 20, 10, 0),
        type: 'meeting',
        description: 'Weekly sync-up'
      },
      {
        title: 'Server Maintenance',
        date: new Date(2026, 0, 25, 14, 0),
        type: 'maintenance',
        description: 'Scheduled downtime'
      },
      {
        title: 'Backup Review',
        date: new Date(2026, 0, 28, 9, 0),
        type: 'reminder',
        description: 'Check backup logs'
      }
    ];
  }

  previousMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1
    );
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1
    );
    this.generateCalendar();
  }

  goToToday() {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  hasEventsOnDate(date: Date): boolean {
    return this.upcomingEvents.some(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  }

  getEventTypeColor(type: string): string {
    switch(type) {
      case 'meeting': return 'text-blue';
      case 'maintenance': return 'text-orange';
      case 'reminder': return 'text-purple';
      default: return 'text-primary';
    }
  }

  getEventTypeIcon(type: string): string {
    switch(type) {
      case 'meeting': return 'groups';
      case 'maintenance': return 'construction';
      case 'reminder': return 'notifications';
      default: return 'event';
    }
  }

  get currentMonthYear(): string {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  date: Date;
  hasEvents: boolean;
}

interface CalendarEvent {
  title: string;
  date: Date;
  type: 'meeting' | 'maintenance' | 'reminder' | 'other';
  description?: string;
}
