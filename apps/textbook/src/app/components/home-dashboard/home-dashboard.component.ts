import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Command Center</h1>
        <p class="subtitle">{{ currentDate | date:'fullDate' }}</p>
      </header>

      <div class="widgets-grid">
        <!-- Quick Note Widget -->
        <div class="glass-panel widget quick-note">
          <div class="widget-header">
            <span class="material-symbols-outlined icon-md">edit_note</span>
            <h3>Quick Note</h3>
          </div>
          <div class="quick-note-input-wrapper">
            <textarea
              class="input-field quick-textarea"
              placeholder="Capture a thought..."
              rows="3"
            ></textarea>
            <div class="hint">Shift + Enter to save</div>
          </div>
        </div>

        <!-- Mini Calendar Widget (Placeholder) -->
        <div class="glass-panel widget calendar">
          <div class="widget-header">
            <span class="material-symbols-outlined icon-md">calendar_month</span>
            <h3>Today</h3>
          </div>
          <div class="calendar-placeholder">
            <div class="big-date">{{ currentDate | date:'d' }}</div>
            <div class="day-name">{{ currentDate | date:'EEEE' }}</div>
          </div>
        </div>

        <!-- Favorites Widget -->
        <div class="glass-panel widget favorites">
           <div class="widget-header">
            <span class="material-symbols-outlined icon-md star-icon">star</span>
            <h3>Favorites</h3>
          </div>
          <div class="favorites-list">
            <div class="empty-state">No pinned items yet.</div>
          </div>
        </div>

        <!-- Quick Access Widget -->
        <div class="glass-panel widget quick-access">
           <div class="widget-header">
            <span class="material-symbols-outlined icon-md">history</span>
            <h3>Quick Access</h3>
          </div>
          <div class="quick-access-grid">
             <div class="empty-state">Recently opened pages will appear here.</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: var(--space-8);
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: var(--space-2);
    }

    .subtitle {
      color: var(--text-secondary);
    }

    .widgets-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-5);
    }

    @media (min-width: 768px) {
      .widgets-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1280px) {
      .widgets-grid {
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: auto auto; /* Allow masonry-ish flow if we span rows */
      }
      
      .quick-note {
        grid-column: span 2;
      }
    }

    .widget {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      height: 100%;
      min-height: 200px;
    }

    .widget-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-muted);
    }

    .widget-header h3 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .star-icon {
      color: var(--yellow);
      font-variation-settings: 'FILL' 1;
    }

    /* Quick Note Styles */
    .quick-note-input-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .quick-textarea {
      flex: 1;
      resize: none;
      background: rgba(0, 0, 0, 0.2);
    }

    .hint {
      position: absolute;
      bottom: var(--space-2);
      right: var(--space-2);
      font-size: 0.75rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    /* Calendar Styles */
    .calendar-placeholder {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .big-date {
      font-size: 4rem;
      font-weight: 700;
      line-height: 1;
      background: linear-gradient(135deg, white, var(--text-muted));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .day-name {
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .empty-state {
      color: var(--text-subtle);
      font-size: 0.875rem;
      font-style: italic;
    }
  `]
})
export class HomeDashboardComponent {
  currentDate = new Date();
}
