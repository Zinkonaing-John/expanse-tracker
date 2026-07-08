"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let ExpensesService = class ExpensesService {
    expenses = [];
    create(createExpenseDto) {
        const expense = {
            id: (0, uuid_1.v4)(),
            ...createExpenseDto,
            description: createExpenseDto.description || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.expenses.push(expense);
        return expense;
    }
    findAll(filter) {
        let result = [...this.expenses];
        const { startDate, endDate, category, minAmount, maxAmount } = filter;
        if (startDate) {
            result = result.filter((e) => e.date >= startDate);
        }
        if (endDate) {
            result = result.filter((e) => e.date <= endDate);
        }
        if (category) {
            result = result.filter((e) => e.category === category);
        }
        if (minAmount !== undefined) {
            result = result.filter((e) => e.amount >= minAmount);
        }
        if (maxAmount !== undefined) {
            result = result.filter((e) => e.amount <= maxAmount);
        }
        result.sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0)
                return dateCompare;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
        if (filter.offset) {
            result = result.slice(filter.offset);
        }
        if (filter.limit) {
            result = result.slice(0, filter.limit);
        }
        return result;
    }
    findOne(id) {
        const expense = this.expenses.find((e) => e.id === id);
        if (!expense) {
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
        }
        return expense;
    }
    update(id, updateExpenseDto) {
        const index = this.expenses.findIndex((e) => e.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
        }
        const updatedExpense = {
            ...this.expenses[index],
            ...updateExpenseDto,
            updatedAt: new Date(),
        };
        this.expenses[index] = updatedExpense;
        return updatedExpense;
    }
    remove(id) {
        const index = this.expenses.findIndex((e) => e.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
        }
        this.expenses.splice(index, 1);
    }
    getSummary(startDate, endDate) {
        const filtered = this.expenses.filter((e) => e.date >= startDate && e.date <= endDate);
        const total = filtered.reduce((sum, e) => sum + e.amount, 0);
        const count = filtered.length;
        const byCategory = {};
        for (const expense of filtered) {
            if (!byCategory[expense.category]) {
                byCategory[expense.category] = { total: 0, count: 0 };
            }
            byCategory[expense.category].total += expense.amount;
            byCategory[expense.category].count += 1;
        }
        return { total, count, byCategory };
    }
    getTodayTotal() {
        const today = new Date().toISOString().split('T')[0];
        return this.getSummary(today, today).total;
    }
    getWeekTotal() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return this.getSummary(weekStart.toISOString().split('T')[0], today.toISOString().split('T')[0]).total;
    }
    getMonthTotal() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return this.getSummary(monthStart.toISOString().split('T')[0], today.toISOString().split('T')[0]).total;
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)()
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map