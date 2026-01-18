import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  @Output() setupComplete = new EventEmitter<void>();
  
  showDoneButton = false;
  schemaCopied = false;

  async openSetup() {
    // Copy schema to clipboard
    try {
      const schema = await fetch('/pb_schema.json').then(r => r.text());
      await navigator.clipboard.writeText(schema);
      this.schemaCopied = true;
    } catch (error) {
      console.error('Failed to copy schema:', error);
    }
    
    // Open PocketBase admin in new tab
    window.open('/_/', '_blank');
    // Show the "Done" button
    this.showDoneButton = true;
  }

  onDone() {
    // Emit event to trigger re-check
    this.setupComplete.emit();
  }
}
