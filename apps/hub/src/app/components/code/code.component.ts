import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.css']
})
export class CodeComponent implements OnInit {
  // Quick stats
  stats = {
    repositories: 12,
    activeProjects: 5,
    issues: 8,
    pullRequests: 3
  };

  // Dev tools and services
  devTools: DevTool[] = [];

  // Recent repositories
  recentRepos: Repository[] = [];

  ngOnInit() {
    this.loadDevTools();
    this.loadRepositories();
  }

  loadDevTools() {
    this.devTools = [
      {
        name: 'GitHub',
        icon: 'code',
        url: 'https://github.com',
        description: 'Source control'
      },
      {
        name: 'GitLab',
        icon: 'source',
        url: 'https://gitlab.com',
        description: 'DevOps platform'
      },
      {
        name: 'VS Code Server',
        icon: 'integration_instructions',
        url: '',
        description: 'Browser IDE'
      },
      {
        name: 'Portainer',
        icon: 'view_in_ar',
        url: '',
        description: 'Container management'
      },
      {
        name: 'Jenkins',
        icon: 'settings_suggest',
        url: '',
        description: 'CI/CD automation'
      },
      {
        name: 'Grafana',
        icon: 'monitoring',
        url: '',
        description: 'Monitoring'
      }
    ];
  }

  loadRepositories() {
    // TODO: Integrate with GitHub/GitLab API
    this.recentRepos = [
      {
        name: 'sh-nexus',
        description: 'Personal dashboard and app launcher',
        language: 'TypeScript',
        updated: new Date(2026, 0, 19),
        stars: 42
      },
      {
        name: 'docker-compose-stack',
        description: 'Self-hosted services configuration',
        language: 'YAML',
        updated: new Date(2026, 0, 18),
        stars: 15
      },
      {
        name: 'automation-scripts',
        description: 'Server automation and maintenance',
        language: 'Python',
        updated: new Date(2026, 0, 15),
        stars: 8
      }
    ];
  }

  openTool(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  getLanguageColor(language: string): string {
    switch(language.toLowerCase()) {
      case 'typescript': return '#3178c6';
      case 'javascript': return '#f7df1e';
      case 'python': return '#3776ab';
      case 'go': return '#00add8';
      case 'rust': return '#ce422b';
      case 'java': return '#b07219';
      case 'yaml': return '#cb171e';
      default: return '#6b7280';
    }
  }
}

interface DevTool {
  name: string;
  icon: string;
  url: string;
  description: string;
}

interface Repository {
  name: string;
  description: string;
  language: string;
  updated: Date;
  stars: number;
}
