"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseSummary = exports.Expense = void 0;
class Expense {
    id;
    amount;
    category;
    description;
    date;
    receiptUri;
    inputMethod;
    createdAt;
    updatedAt;
}
exports.Expense = Expense;
class ExpenseSummary {
    total;
    count;
    byCategory;
}
exports.ExpenseSummary = ExpenseSummary;
//# sourceMappingURL=expense.entity.js.map