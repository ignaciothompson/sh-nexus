import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { PocketbaseService } from './pocketbase.service';
import { Section } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class SectionsService {
  private collectionName = 'sections';

  constructor(private pbService: PocketbaseService) {}

  getAll(): Observable<Section[]> {
    return from(
      this.pbService.client.collection(this.collectionName).getFullList({
        sort: 'order',
        $autoCancel: false
      })
    ).pipe(
      map(sections => sections.map(s => ({
        id: s.id,
        title: s['title'],
        order: s['order'],
        AppItems: []
      })))
    );
  }

  create(section: Section): Observable<Section> {
    return from(
      this.pbService.client.collection(this.collectionName).create(section)
    ).pipe(
      map(r => ({ ...section, id: r.id }))
    );
  }

  update(id: string, section: Section): Observable<any> {
    return from(
      this.pbService.client.collection(this.collectionName).update(id, section)
    );
  }

  delete(id: string): Observable<any> {
    return from(
      this.pbService.client.collection(this.collectionName).delete(id)
    );
  }
}
