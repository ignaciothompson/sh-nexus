import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {
  private pb: PocketBase;

  constructor() {
    // Connect to external PocketBase instance
    this.pb = new PocketBase('https://ntdb.ignaciothompson.com');
  }

  get client(): PocketBase {
    return this.pb;
  }
}
