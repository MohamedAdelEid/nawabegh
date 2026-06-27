export interface SubscriptionRow {
  id: string;
  parentName: string;
  studentName: string;
  planTypeId: "gold" | "basic";
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface SubscriptionDetails {
  id: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  totalPaid: string;
  currentStep: number;
}

export interface TransactionRow {
  id: string;
  bankRef: string;
  userName: string;
  studentName: string;
  typeLabel: string;
  amount: string;
  statusId: "success" | "failed" | "pending" | "refunded";
  date: string;
}

const SUBSCRIPTIONS: SubscriptionRow[] = [
  {
    id: "sub-001",
    parentName: "أحمد محمود",
    studentName: "سارة أحمد",
    planTypeId: "gold",
    startDate: "2023-10-12",
    endDate: "2024-10-12",
    active: true,
  },
  {
    id: "sub-002",
    parentName: "نورة علي",
    studentName: "محمد يوسف",
    planTypeId: "basic",
    startDate: "2023-01-15",
    endDate: "2024-01-15",
    active: false,
  },
  {
    id: "sub-003",
    parentName: "خالد ليبب",
    studentName: "ليلى خالد",
    planTypeId: "gold",
    startDate: "2023-11-20",
    endDate: "2024-11-20",
    active: true,
  },
];

const SUBSCRIPTION_DETAILS: Record<string, SubscriptionDetails> = {
  "sub-001": {
    id: "sub-001",
    parentName: "خالد العلمي",
    parentEmail: "k.alarimi@email.com",
    studentName: "أحمد محمد العلمي",
    totalPaid: "2,400 ر.ع.",
    currentStep: 2,
  },
};

const TRANSACTIONS: TransactionRow[] = [
  {
    id: "trx-8820",
    bankRef: "#TRX-8820",
    userName: "أحمد علي منصور",
    studentName: "فؤاد أحمد علي",
    typeLabel: "بطاقة مدى",
    amount: "450.00 ر.ع.",
    statusId: "success",
    date: "2023/10/24",
  },
  {
    id: "trx-8821",
    bankRef: "#TRX-8821",
    userName: "سارة خالد",
    studentName: "نورة خالد",
    typeLabel: "Apple Pay",
    amount: "2,100.00 ر.ع.",
    statusId: "failed",
    date: "2023/10/24",
  },
  {
    id: "trx-8822",
    bankRef: "#TRX-8822",
    userName: "ياسر محمود",
    studentName: "عمر ياسر",
    typeLabel: "تحويل بنكي",
    amount: "850.00 ر.ع.",
    statusId: "pending",
    date: "2023/10/23",
  },
];

export async function getSubscriptionsData(): Promise<SubscriptionRow[]> {
  await Promise.resolve();
  return SUBSCRIPTIONS;
}

export async function getSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetails | null> {
  await Promise.resolve();
  return SUBSCRIPTION_DETAILS[subscriptionId] ?? null;
}

export async function getTransactionsData(): Promise<TransactionRow[]> {
  await Promise.resolve();
  return TRANSACTIONS;
}
