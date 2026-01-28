import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatResponse } from '../../models/types';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container sh-card" [class.open]="isOpen">
      <div class="chat-header" (click)="toggleChat()">
        <span>🤖 AI Assistant</span>
        <span class="toggle-icon">{{ isOpen ? '▼' : '▲' }}</span>
      </div>
      
      @if (isOpen) {
        <div class="chat-body">
          <div class="messages">
            @for (msg of messages; track $index) {
              <div [class]="'message ' + msg.sender">
                <p>{{ msg.text }}</p>
              </div>
            }
            @if (isLoading) {
              <div class="message bot loading">Thinking...</div>
            }
          </div>
          
          <div class="input-area">
            <input [(ngModel)]="userInput" (keyup.enter)="sendMessage()" placeholder="Ask for a recommendation..." [disabled]="isLoading">
            <button (click)="sendMessage()" [disabled]="isLoading || !userInput.trim()">Send</button>
          </div>
        </div>
      }
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
      background: var(--sh-primary);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      border-radius: var(--sh-radius-lg) var(--sh-radius-lg) 0 0;
      font-weight: bold;
      color: white;
    }
    .chat-body {
      height: 400px;
      display: flex;
      flex-direction: column;
      background: var(--sh-bg-card);
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
    .message p {
      margin: 0;
    }
    .message.user {
      background: var(--sh-primary);
      align-self: flex-end;
      border-bottom-right-radius: 2px;
      color: white;
    }
    .message.bot {
      background: var(--sh-bg-elevated);
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .input-area {
      padding: 15px;
      display: flex;
      gap: 10px;
      border-top: 1px solid var(--sh-border-default);
    }
    input {
      flex: 1;
      background: var(--sh-bg-elevated);
      border: 1px solid var(--sh-border-default);
      color: var(--sh-text-primary);
      padding: 8px 12px;
      border-radius: var(--sh-radius-md);
      outline: none;
    }
    button {
      background: var(--sh-secondary);
      border: none;
      color: white;
      padding: 5px 15px;
      border-radius: var(--sh-radius-md);
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
  messages: { text: string; sender: 'user' | 'bot' }[] = [
    { text: 'Hi! I can help you find movies and shows to watch. What are you in the mood for?', sender: 'bot' }
  ];
  isLoading = false;

  private chatService = inject(ChatService);

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const text = this.userInput;
    this.messages.push({ text, sender: 'user' });
    this.userInput = '';
    this.isLoading = true;

    this.chatService.getRecommendation(text).subscribe({
      next: (res: ChatResponse) => {
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
