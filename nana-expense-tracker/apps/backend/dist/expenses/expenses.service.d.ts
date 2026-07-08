import { CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto } from './dto';
import { Expense, ExpenseSummary } from './expense.entity';
export declare class ExpensesService {
    private expenses;
    create(createExpenseDto: CreateExpenseDto): Expense;
    findAll(filter: ExpenseFilterDto): Expense[];
    findOne(id: string): Expense;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Expense;
    remove(id: string): void;
    getSummary(startDate: string, endDate: string): ExpenseSummary;
    getTodayTotal(): number;
    getWeekTotal(): number;
    getMonthTotal(): number;
}
