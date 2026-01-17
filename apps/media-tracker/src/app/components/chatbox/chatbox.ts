import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container glass-panel" [class.open]="isOpen">
      <div class="chat-header" (click)="toggleChat()">
        <span>🤖 AI Assistant</span>
        <span class="toggle-icon">{{ isOpen ? '▼' : '▲' }}</span>
      </div>
      
      <div class="chat-body" *ngIf="isOpen">
        <div class="messages">
          <div *ngFor="let msg of messages" [class]="'message ' + msg.sender">
            <p>{{ msg.text }}</p>
          </div>
          <div *ngIf="isLoading" class="message bot loading">Thinking...</div>
        </div>
        
        <div class="input-area">
          <input [(ngModel)]="userInput" (keyup.enter)="sendMessage()" placeholder="Ask for a recommendation..." [disabled]="isLoading">
          <button (click)="sendMessage()" [disabled]="isLoading || !userInput.trim()">Send</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      z-index: 1000;
      transition: all 0.3s ease;
    }
    .chat-container:not(.open) {
      width: 200px;
      height: 50px;
      overflow: hidden;
    }
    .chat-header {
      padding: 15px;
      background: rgba(99, 102, 241, 0.8);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      border-radius: 12px 12px 0 0;
      font-weight: bold;
    }
    .chat-body {
      height: 400px;
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.9);
    }
    .messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .message {
      padding: 10px;
      border-radius: 10px;
      max-width: 80%;
      font-size: 0.9rem;
    }
    .message.user {
      background: var(--primary-color);
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .message.bot {
      background: var(--surface-light);
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .input-area {
      padding: 15px;
      display: flex;
      gap: 10px;
      border-top: 1px solid var(--glass-border);
    }
    input {
      flex: 1;
      background: rgba(0,0,0,0.3);
      border: 1px solid var(--glass-border);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      outline: none;
    }
    button {
      background: var(--secondary-color);
      border: none;
      color: white;
      padding: 5px 15px;
      border-radius: 8px;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.5;
    }
  `]
})
export class ChatboxComponent {
  isOpen = false;
  userInput = '';
  messages: { text: string, sender: 'user' | 'bot' }[] = [
    { text: 'Hi! I can help you find movies and shows to watch. What are you in the mood for?', sender: 'bot' }
  ];
  isLoading = false;

  constructor(private api: ApiService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const text = this.userInput;
    this.messages.push({ text, sender: 'user' });
    this.userInput = '';
    this.isLoading = true;

    this.api.getRecommendation(text).subscribe({
      next: (res) => {
        this.messages.push({ text: res.response, sender: 'bot' });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' });
        this.isLoading = false;
      }
    });
  }
}
