import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  private categories: Category[] = [];

  constructor() {
    this.seedDefaultCategories();
  }

  private seedDefaultCategories() {
    const defaults = [
      { name: 'Food', icon: '🍔', color: '#f97316' },
      { name: 'Coffee', icon: '☕', color: '#92400e' },
      { name: 'Transport', icon: '🚗', color: '#3b82f6' },
      { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
      { name: 'Entertainment', icon: '🎬', color: '#a855f7' },
      { name: 'Bills', icon: '📄', color: '#ef4444' },
      { name: 'Health', icon: '💊', color: '#22c55e' },
      { name: 'Other', icon: '📦', color: '#6b7280' },
    ];

    const now = new Date();
    this.categories = defaults.map((cat) => ({
      id: uuidv4(),
      ...cat,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    }));
  }

  findAll(): Category[] {
    return this.categories;
  }

  findOne(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id);
  }

  findByName(name: string): Category | undefined {
    return this.categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
  }
}
