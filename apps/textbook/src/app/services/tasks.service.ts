import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { PlannerItem } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private collectionName = 'planner_items';

  constructor(private pbService: PocketbaseService) {}

  async getAll(): Promise<PlannerItem[]> {
    const records = await this.pbService.client
      .collection(this.collectionName)
      .getFullList<PlannerItem>({ 
        sort: 'order,-updated',
        requestKey: null
      });
    return records;
  }

  async getByStatus(status: PlannerItem['status']): Promise<PlannerItem[]> {
    return await this.pbService.client
      .collection(this.collectionName)
      .getFullList<PlannerItem>({ 
        filter: `status = "${status}"`,
        sort: 'order,-updated',
        requestKey: null 
      });
  }

  async create(item: Partial<PlannerItem>): Promise<PlannerItem> {
    return await this.pbService.client
      .collection(this.collectionName)
      .create<PlannerItem>(item, { requestKey: null });
  }

  async update(id: string, item: Partial<PlannerItem>): Promise<PlannerItem> {
    return await this.pbService.client
      .collection(this.collectionName)
      .update<PlannerItem>(id, item, { requestKey: null });
  }

  async updateStatus(id: string, status: PlannerItem['status']): Promise<PlannerItem> {
    const updateData: Partial<PlannerItem> = { status };
    return await this.pbService.client
      .collection(this.collectionName)
      .update<PlannerItem>(id, updateData, { requestKey: null });
  }

  async delete(id: string): Promise<boolean> {
    await this.pbService.client
      .collection(this.collectionName)
      .delete(id, { requestKey: null });
    return true;
  }
}
