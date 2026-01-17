import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {
  private pb: PocketBase;

  constructor() {
    // Connect to external PocketBase instance
    this.pb = new PocketBase('http://127.0.0.1:5102');
  }

  get client(): PocketBase {
    return this.pb;
  }
}
