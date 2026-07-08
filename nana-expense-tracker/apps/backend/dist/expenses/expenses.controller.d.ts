import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto } from './dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto): import("./expense.entity").Expense;
    findAll(filter: ExpenseFilterDto): import("./expense.entity").Expense[];
    getSummary(startDate: string, endDate: string): import("./expense.entity").ExpenseSummary;
    getStats(): {
        todayTotal: number;
        weekTotal: number;
        monthTotal: number;
    };
    findOne(id: string): import("./expense.entity").Expense;
    update(id: string, updateExpenseDto: UpdateExpenseDto): import("./expense.entity").Expense;
    remove(id: string): void;
}
