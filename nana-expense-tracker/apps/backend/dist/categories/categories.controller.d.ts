import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): import("./category.entity").Category[];
    findOne(id: string): import("./category.entity").Category;
}
