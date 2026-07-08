export declare enum InputMethod {
    VOICE = "voice",
    CAMERA = "camera",
    MANUAL = "manual"
}
export declare class CreateExpenseDto {
    amount: number;
    category: string;
    description?: string;
    date: string;
    receiptUri?: string;
    inputMethod: InputMethod;
}
