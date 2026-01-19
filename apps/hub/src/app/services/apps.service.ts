import { Injectable } from '@angular/core';
import { Observable, from, map, catchError } from 'rxjs';
import { PocketbaseService } from './pocketbase.service';
import { AppItem, Section, DashboardData } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  private collectionName = 'apps';

  constructor(private pbService: PocketbaseService) {}

  // Get all apps with sections for dashboard
  getDashboardData(): Observable<DashboardData> {
    return from(
      Promise.all([
        this.pbService.client.collection('sections').getFullList({ 
          sort: 'order', 
          $autoCancel: false 
        }),
        this.pbService.client.collection('apps').getFullList({ 
          sort: 'order', 
          filter: 'type = "app"', 
          $autoCancel: false 
        })
      ])
    ).pipe(
      map(([pbSections, pbApps]) => {
        const sections: Section[] = pbSections.map(s => ({
          id: s.id,
          title: s['title'],
          order: s['order'],
          AppItems: []
        }));

        pbApps.forEach(app => {
          const sec = sections.find(s => s.id === app['section']);
          if (sec) {
            sec.AppItems?.push(this.mapPbApp(app));
          }
        });

        return { sections, bookmarks: [] };
      })
    );
  }

  getBookmarks(): Observable<AppItem[]> {
    return from(
      this.pbService.client.collection(this.collectionName).getFullList({
        sort: 'order',
        filter: 'type = "bookmark"',
        $autoCancel: false
      })
    ).pipe(
      map(records => records.map(r => this.mapPbApp(r)))
    );
  }

  create(app: AppItem, iconFile?: File): Observable<AppItem> {
    const formData = new FormData();
    formData.append('name', app.name);
    formData.append('url', app.url);
    if (app.order) formData.append('order', app.order.toString());
    if (app.section) formData.append('section', app.section);
    formData.append('type', app.type || 'app');
    if (app.iconUrl) formData.append('iconUrl', app.iconUrl);
    if (app.templateId) formData.append('templateId', app.templateId);
    if (app.config) formData.append('config', JSON.stringify(app.config));
    formData.append('healthCheck', (app.healthCheck !== false).toString());
    if (iconFile) formData.append('icon', iconFile);

    return from(
      this.pbService.client.collection(this.collectionName).create(formData)
    ).pipe(
      map(r => this.mapPbApp(r)),
      catchError(err => {
        console.error('Failed to add app:', err);
        throw err;
      })
    );
  }

  update(id: string, app: AppItem, iconFile?: File): Observable<any> {
    const formData = new FormData();
    if (app.name) formData.append('name', app.name);
    if (app.url) formData.append('url', app.url);
    if (app.order !== undefined) formData.append('order', app.order.toString());
    if (app.section !== undefined) formData.append('section', app.section || '');
    if (app.type) formData.append('type', app.type);
    if (app.iconUrl !== undefined) formData.append('iconUrl', app.iconUrl);
    if (app.templateId !== undefined) formData.append('templateId', app.templateId || '');
    if (app.config !== undefined) formData.append('config', JSON.stringify(app.config));
    if (app.healthCheck !== undefined) formData.append('healthCheck', app.healthCheck.toString());
    if (iconFile) formData.append('icon', iconFile);

    return from(
      this.pbService.client.collection(this.collectionName).update(id, formData)
    ).pipe(
      catchError(err => {
        console.error('Failed to update app:', err);
        throw err;
      })
    );
  }

  delete(id: string): Observable<any> {
    return from(
      this.pbService.client.collection(this.collectionName).delete(id)
    );
  }

  private mapPbApp(record: any): AppItem {
    let icon = record['iconUrl'];
    if (record['icon']) {
      icon = this.pbService.client.files.getURL(record, record['icon']);
    }

    let config: Record<string, string> | undefined;
    if (record['config']) {
      try {
        config = typeof record['config'] === 'string' 
          ? JSON.parse(record['config']) 
          : record['config'];
      } catch (e) {
        console.warn('Failed to parse app config:', e);
      }
    }

    return {
      id: record.id,
      name: record['name'],
      url: record['url'],
      icon: icon,
      order: record['order'],
      section: record['section'],
      type: record['type'],
      templateId: record['templateId'],
      config: config,
      healthCheck: record['healthCheck'] ?? true
    };
  }
}
