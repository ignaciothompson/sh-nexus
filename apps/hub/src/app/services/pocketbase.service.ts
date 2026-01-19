import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {
  private pb: PocketBase;

  constructor() {
    // Production: uncomment this line
    const pbUrl = 'https://dashboard.sh-nexus.com';
    // Dev: uncomment this line
    // const pbUrl = 'http://localhost:5100';
    
    this.pb = new PocketBase(pbUrl);
  }

  get client(): PocketBase {
    return this.pb;
  }

  // Health check - verify PocketBase is initialized
  async checkHealth(): Promise<boolean> {
    try {
      await this.pb.health.check();
      // Also verify DB is initialized by checking a collection
      await this.pb.collection('sections').getList(1, 1, { $autoCancel: false });
      return true;
    } catch (error) {
      return false;
    }
  }
}
