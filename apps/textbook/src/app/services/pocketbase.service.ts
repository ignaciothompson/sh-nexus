import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {
  private pb: PocketBase;

  constructor() {
    // PocketBase URL - Comment/uncomment based on environment
    // Production: uncomment this line
    const pbUrl = 'https://textbook.sh-nexus.com';
    
    // Dev: uncomment this line
    // const pbUrl = 'http://localhost:5102';
    
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
      await this.pb.collection('books').getList(1, 1, { $autoCancel: false });
      return true;
    } catch (error) {
      return false;
    }
  }
}
