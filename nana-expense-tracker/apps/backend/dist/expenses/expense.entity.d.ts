import { InputMethod } from './dto/create-expense.dto';
export declare class Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    receiptUri?: string;
    inputMethod: InputMethod;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ExpenseSummary {
    total: number;
    count: number;
    byCategory: Record<string, {
        total: number;
        count: number;
    }>;
}
