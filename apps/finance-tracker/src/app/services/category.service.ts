import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Category } from '../models/types';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private cachedCategories: Category[] = [];

  constructor(private pbService: PocketbaseService) {}

  async getAll(): Promise<Category[]> {
    try {
      this.cachedCategories = await this.pbService.client
        .collection('categories')
        .getFullList<Category>({ sort: 'orden' });
      return this.cachedCategories;
    } catch {
      return this.cachedCategories;
    }
  }

  async create(category: Partial<Category>): Promise<Category> {
    const result = await this.pbService.client
      .collection('categories')
      .create<Category>(category);
    await this.getAll(); // refresh cache
    return result;
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const result = await this.pbService.client
      .collection('categories')
      .update<Category>(id, data);
    await this.getAll(); // refresh cache
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.pbService.client
      .collection('categories')
      .delete(id);
    await this.getAll(); // refresh cache
  }

  /**
   * Obtiene el color asociado a un nombre de categoría.
   * Usa cache para evitar fetch en cada llamada.
   */
  getCategoryColor(categoryName: string): string {
    const cat = this.cachedCategories.find(
      c => c.nombre.toLowerCase() === categoryName.toLowerCase()
    );
    return cat?.color || '#6b7280';
  }

  /**
   * Obtiene el ícono asociado a un nombre de categoría.
   */
  getCategoryIcon(categoryName: string): string {
    const cat = this.cachedCategories.find(
      c => c.nombre.toLowerCase() === categoryName.toLowerCase()
    );
    return cat?.icono || 'label';
  }

  /**
   * Devuelve un map de nombre→color para charts.
   */
  getCategoryColorMap(): Record<string, string> {
    const map: Record<string, string> = {};
    this.cachedCategories.forEach(c => {
      map[c.nombre] = c.color;
    });
    return map;
  }

  /**
   * Devuelve las categorías cacheadas (sin fetch).
   */
  getCached(): Category[] {
    return this.cachedCategories;
  }
}
