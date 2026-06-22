export type TransactionStatus =
  | "succeeded"
  | "failed"
  | "pending"
  | "expired"
  | "cancelled";

export type EnrollmentStatus = "active" | "expired" | "inactive";

export type ProductType = "course" | "bundle";

export type OperationType = "purchase" | "renewal" | "activation" | "free";

export type CheckoutPaymentMethodFilter = 0 | 1 | 2 | 3;

export type EnrollmentAccessFilter = 0 | 1 | 2 | 3;

export type AdminPaymentPartyUser = {
  userId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

export type AdminPaymentStudentParty = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  gradeNameAr: string | null;
  educationLevelNameAr: string | null;
  schoolName: string | null;
};

export type AdminPaymentParties = {
  parent: AdminPaymentPartyUser | null;
  student: AdminPaymentStudentParty;
};

export type AdminPaymentTransactionListItem = {
  id: string;
  isPaymentTransaction: boolean;
  sessionId: string;
  referenceNumber: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl: string | null;
  parentUserId: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentAvatarUrl: string | null;
  productType: ProductType;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentMethodLabelAr: string;
  providerKey: string;
  status: TransactionStatus | string;
  statusLabelAr: string;
  occurredAt: string | null;
  createdAt: string;
};

export type AdminPaymentsOverviewSummary = {
  totalRevenue: number;
  currency: string;
  revenueChangePercent: number;
  activeEnrollments: number;
  activeEnrollmentsChangePercent: number;
  failedPaymentCount: number;
  failedPaymentsChangePercent: number;
};

export type AdminPaymentsMonthlyRevenue = {
  year: number;
  month: number;
  amount: number;
  currency: string;
};

export type AdminPaymentsOverview = {
  summary: AdminPaymentsOverviewSummary;
  monthlyRevenue: AdminPaymentsMonthlyRevenue[];
  recentTransactions: AdminPaymentTransactionListItem[];
};

export type AdminPaymentTransactionsSummary = {
  totalRevenue: number;
  currency: string;
  revenueChangePercent: number;
  succeededCount: number;
  successRatePercent: number;
  failedCount: number;
};

export type AdminPaymentTransactionsPage = {
  summary: AdminPaymentTransactionsSummary;
  items: AdminPaymentTransactionListItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type AdminPaymentTimelineEvent = {
  key: string;
  labelAr: string;
  occurredAt: string | null;
  isCompleted: boolean;
};

export type AdminPaymentAccessGranted = {
  startsAt: string | null;
  endsAt: string | null;
  endsAtDisplay: string | null;
  accessDurationDays: number | null;
};

export type AdminPaymentInvoice = {
  referenceNumber: string;
  studentName: string;
  productName: string;
  currency: string;
  originalPrice: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  finalPrice: number;
  paymentMethod: string;
  couponCode: string | null;
  paidAt: string | null;
};

export type AdminPaymentTransactionDetail = {
  id: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: TransactionStatus | string;
  statusLabelAr: string;
  occurredAt: string | null;
  operationType: OperationType | string;
  operationTypeLabelAr: string;
  paymentMethodLabelAr: string;
  providerKey: string;
  parties: AdminPaymentParties;
  invoice: AdminPaymentInvoice | null;
  timeline: AdminPaymentTimelineEvent[];
  accessGranted: AdminPaymentAccessGranted | null;
};

export type AdminStudentEnrollmentListItem = {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl: string | null;
  parentUserId: string | null;
  parentName: string | null;
  parentAvatarUrl: string | null;
  courseId: string;
  courseTitle: string;
  bundleId: string | null;
  bundleName: string | null;
  productName: string;
  productType: ProductType;
  status: EnrollmentStatus | string;
  statusLabelAr: string;
  startsAt: string | null;
  endsAt: string | null;
  endsAtDisplay: string | null;
  enrolledAt: string | null;
};

export type AdminStudentEnrollmentsSummary = {
  totalEnrollments: number;
  activeCount: number;
  expiredCount: number;
  inactiveCount: number;
};

export type AdminStudentEnrollmentsPage = {
  summary: AdminStudentEnrollmentsSummary;
  items: AdminStudentEnrollmentListItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type AdminStudentEnrollmentPaymentHistoryItem = {
  id: string;
  isPaymentTransaction: boolean;
  sessionId: string;
  referenceNumber: string;
  paidAt: string | null;
  description: string;
  amount: number;
  currency: string;
  status: TransactionStatus | string;
  statusLabelAr: string;
  paymentMethod: string;
  paymentMethodLabelAr: string;
};

export type AdminStudentEnrollmentPaymentSummary = {
  totalPaid: number;
  currency: string;
  paymentCount: number;
  summaryLabelAr: string;
};

export type AdminStudentEnrollmentProduct = {
  productName: string;
  productType: ProductType;
  courseTitle: string | null;
  bundleName: string | null;
  startsAt: string | null;
  endsAtDisplay: string | null;
  accessDurationDays: number | null;
  paymentMethodLabelAr: string | null;
};

export type AdminStudentEnrollmentTimeline = {
  accountCreatedAt: string | null;
  firstPaymentAt: string | null;
  isActiveNow: boolean;
  endsAtDisplay: string | null;
  progressPercent: number;
};

export type AdminStudentEnrollmentDetail = {
  enrollmentId: string;
  paymentSummary: AdminStudentEnrollmentPaymentSummary;
  parties: AdminPaymentParties;
  product: AdminStudentEnrollmentProduct;
  timeline: AdminStudentEnrollmentTimeline;
  paymentHistory: AdminStudentEnrollmentPaymentHistoryItem[];
};

export type PaymentGatewaySettings = {
  provider: string;
  merchantId: string;
  isConfiguredInDatabase: boolean;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  secretKeyHint: string | null;
  webhookSecretHint: string | null;
};

export type UpdatePaymentGatewaySettingsPayload = {
  provider: string;
  merchantId: string;
  secretKey?: string;
  webhookSecret?: string;
};

export type PaymentTransactionsListParams = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: string;
  method?: CheckoutPaymentMethodFilter;
  fromDate?: string;
  toDate?: string;
};

export type StudentEnrollmentsListParams = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: EnrollmentAccessFilter;
  courseId?: string;
  bundleId?: string;
  startsFrom?: string;
  startsTo?: string;
  endsFrom?: string;
  endsTo?: string;
};

export const TRANSACTION_STATUS = {
  succeeded: "succeeded",
  failed: "failed",
  pending: "pending",
  expired: "expired",
  cancelled: "cancelled",
} as const;

export const ENROLLMENT_ACCESS_FILTER = {
  all: 0,
  active: 1,
  expired: 2,
  inactive: 3,
} as const;

export const CHECKOUT_PAYMENT_METHOD_FILTER = {
  none: 0,
  visa: 1,
  activationCode: 2,
  free: 3,
} as const;
