import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({ providedIn: 'root' })
export class PocketbaseService {
  private pb: PocketBase;

  constructor() {
    // In Docker, PocketBase serves both API + frontend on the same origin
    // In dev, the proxy.conf.json handles /api/* -> localhost:5103
    const url = window.location.origin;
    this.pb = new PocketBase(url);
  }

  get client(): PocketBase {
    return this.pb;
  }
}
