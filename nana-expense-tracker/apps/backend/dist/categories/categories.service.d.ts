import { Category } from './category.entity';
export declare class CategoriesService {
    private categories;
    constructor();
    private seedDefaultCategories;
    findAll(): Category[];
    findOne(id: string): Category | undefined;
    findByName(name: string): Category | undefined;
}
