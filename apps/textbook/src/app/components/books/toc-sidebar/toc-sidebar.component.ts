import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TocItem {
  id: string;
  title: string;
  level: number;
  active: boolean;
}

interface LinkedPage {
  title: string;
  icon: string;
}

@Component({
  selector: 'app-toc-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toc-sidebar.component.html',
  styleUrls: ['./toc-sidebar.component.css']
})
export class TocSidebarComponent implements OnChanges {
  @Input() content: string = '';
  
  tocItems: TocItem[] = [];

  linkedPages: LinkedPage[] = [
    { title: 'Authentication Guide', icon: 'link' },
    { title: 'Webhooks Specification', icon: 'link' }
  ];

  wordCount = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.generateToc();
      this.calculateWordCount();
    }
  }

  generateToc(): void {
    this.tocItems = [];
    
    if (!this.content) {
      return;
    }

    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent?.trim() || '';
      const id = `heading-${index}`;
      
      this.tocItems.push({
        id,
        title: text,
        level,
        active: index === 0
      });
    });
  }

  calculateWordCount(): void {
    if (!this.content) {
      this.wordCount = 0;
      return;
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.content, 'text/html');
    const text = doc.body.textContent || '';
    this.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  scrollToSection(item: TocItem): void {
    // Update active state
    this.tocItems.forEach(i => i.active = false);
    item.active = true;

    // TODO: Scroll to actual section in editor
    console.log('Scroll to:', item.id);
  }
}
