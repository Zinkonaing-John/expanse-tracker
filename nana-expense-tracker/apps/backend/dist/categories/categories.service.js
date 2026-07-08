"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let CategoriesService = class CategoriesService {
    categories = [];
    constructor() {
        this.seedDefaultCategories();
    }
    seedDefaultCategories() {
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
            id: (0, uuid_1.v4)(),
            ...cat,
            isDefault: true,
            createdAt: now,
            updatedAt: now,
        }));
    }
    findAll() {
        return this.categories;
    }
    findOne(id) {
        return this.categories.find((c) => c.id === id);
    }
    findByName(name) {
        return this.categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map