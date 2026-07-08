import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto } from './dto';
import { Expense, ExpenseSummary } from './expense.entity';

@Injectable()
export class ExpensesService {
  private expenses: Expense[] = [];

  create(createExpenseDto: CreateExpenseDto): Expense {
    const expense: Expense = {
      id: uuidv4(),
      ...createExpenseDto,
      description: createExpenseDto.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.expenses.push(expense);
    return expense;
  }

  findAll(filter: ExpenseFilterDto): Expense[] {
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
      if (dateCompare !== 0) return dateCompare;
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

  findOne(id: string): Expense {
    const expense = this.expenses.find((e) => e.id === id);
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  update(id: string, updateExpenseDto: UpdateExpenseDto): Expense {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    const updatedExpense: Expense = {
      ...this.expenses[index],
      ...updateExpenseDto,
      updatedAt: new Date(),
    };

    this.expenses[index] = updatedExpense;
    return updatedExpense;
  }

  remove(id: string): void {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    this.expenses.splice(index, 1);
  }

  getSummary(startDate: string, endDate: string): ExpenseSummary {
    const filtered = this.expenses.filter(
      (e) => e.date >= startDate && e.date <= endDate,
    );

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    const count = filtered.length;

    const byCategory: Record<string, { total: number; count: number }> = {};
    for (const expense of filtered) {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = { total: 0, count: 0 };
      }
      byCategory[expense.category].total += expense.amount;
      byCategory[expense.category].count += 1;
    }

    return { total, count, byCategory };
  }

  getTodayTotal(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.getSummary(today, today).total;
  }

  getWeekTotal(): number {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    return this.getSummary(
      weekStart.toISOString().split('T')[0],
      today.toISOString().split('T')[0],
    ).total;
  }

  getMonthTotal(): number {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return this.getSummary(
      monthStart.toISOString().split('T')[0],
      today.toISOString().split('T')[0],
    ).total;
  }
}
