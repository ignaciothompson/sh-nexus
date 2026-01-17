import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Task } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private collectionName = 'tasks';

  constructor(private pbService: PocketbaseService) {}

  async getAll(): Promise<Task[]> {
    const records = await this.pbService.client
      .collection(this.collectionName)
      .getFullList<Task>({ 
        sort: '-updated',
        requestKey: null // Disable auto-cancellation
      });
    return records;
  }

  async getById(id: string): Promise<Task> {
    return await this.pbService.client
      .collection(this.collectionName)
      .getOne<Task>(id, { requestKey: null });
  }

  async getByStatus(status: Task['status']): Promise<Task[]> {
    return await this.pbService.client
      .collection(this.collectionName)
      .getFullList<Task>({ 
        filter: `status = "${status}"`,
        sort: '-updated',
        requestKey: null 
      });
  }

  async create(task: Partial<Task>): Promise<Task> {
    return await this.pbService.client
      .collection(this.collectionName)
      .create<Task>(task, { requestKey: null });
  }

  async update(id: string, task: Partial<Task>): Promise<Task> {
    return await this.pbService.client
      .collection(this.collectionName)
      .update<Task>(id, task, { requestKey: null });
  }

  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    const updateData: Partial<Task> = { status };
    
    // Set completedAt when task is marked as done
    if (status === 'done') {
      updateData.completedAt = new Date().toISOString();
    } else {
      updateData.completedAt = null;
    }
    
    return await this.pbService.client
      .collection(this.collectionName)
      .update<Task>(id, updateData, { requestKey: null });
  }

  async delete(id: string): Promise<boolean> {
    await this.pbService.client
      .collection(this.collectionName)
      .delete(id, { requestKey: null });
    return true;
  }
}
