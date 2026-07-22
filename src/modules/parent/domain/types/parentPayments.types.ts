export type ParentPaymentTransactionStatus =
  | "succeeded"
  | "failed"
  | "pending"
  | "expired"
  | "cancelled";

export type ParentPaymentProductType = "course" | "bundle";

export type ParentPaymentOperationType =
  | "purchase"
  | "renewal"
  | "activation"
  | "free";

export type ParentPaymentsSummary = {
  totalSpent: number;
  currency: string;
  succeededCount: number;
  pendingCount: number;
  failedCount: number;
};

export type ParentActiveSubscription = {
  enrollmentId: string;
  studentUserId: string;
  studentName: string;
  studentAvatarUrl: string | null;
  productName: string;
  productNameAr?: string | null;
  productType: ParentPaymentProductType | string;
  status: string;
  statusLabelAr?: string | null;
  statusLabelEn?: string | null;
  endsAt: string | null;
  endsAtDisplay?: string | null;
  courseId?: string | null;
  bundleId?: string | null;
  features?: string[] | null;
};

export type ParentAvailableOffer = {
  bundleId: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number;
  currency: string;
  discountPercent?: number | null;
  imageUrl?: string | null;
};

export type ParentPaymentTransactionListItem = {
  id: string;
  sessionId: string | null;
  referenceNumber: string;
  studentUserId: string;
  studentName: string;
  studentAvatarUrl: string | null;
  productName: string;
  productNameAr?: string | null;
  productType: ParentPaymentProductType | string;
  amount: number;
  currency: string;
  status: ParentPaymentTransactionStatus | string;
  statusLabelAr?: string | null;
  statusLabelEn?: string | null;
  occurredAt: string | null;
  createdAt: string;
};

export type ParentPaymentsDashboard = {
  activeSubscriptions: ParentActiveSubscription[];
  availableOffers: ParentAvailableOffer[];
  summary: ParentPaymentsSummary;
  recentTransactions: ParentPaymentTransactionListItem[];
};

export type ParentPaymentTransactionsQuery = {
  pageNumber: number;
  pageSize: number;
  studentUserId?: string;
  status?: ParentPaymentTransactionStatus | string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  method?: string;
};

export type ParentPaymentTransactionsPage = {
  items: ParentPaymentTransactionListItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type ParentPaymentPartyUser = {
  userId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type ParentPaymentStudentParty = {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  gradeNameAr?: string | null;
  gradeNameEn?: string | null;
  educationLevelNameAr?: string | null;
  educationLevelNameEn?: string | null;
  schoolName?: string | null;
};

export type ParentPaymentTimelineEvent = {
  key: string;
  labelAr?: string | null;
  labelEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  occurredAt: string | null;
  isCompleted: boolean;
};

export type ParentPaymentInvoice = {
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
  couponCode?: string | null;
  paidAt?: string | null;
};

export type ParentPaymentTransactionDetail = {
  id: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: ParentPaymentTransactionStatus | string;
  statusLabelAr?: string | null;
  statusLabelEn?: string | null;
  occurredAt: string | null;
  operationType: ParentPaymentOperationType | string;
  operationTypeLabelAr?: string | null;
  operationTypeLabelEn?: string | null;
  paymentMethodLabelAr?: string | null;
  paymentMethodLabelEn?: string | null;
  providerKey?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
  cardHolderName?: string | null;
  parties: {
    parent: ParentPaymentPartyUser | null;
    student: ParentPaymentStudentParty;
  };
  invoice: ParentPaymentInvoice | null;
  timeline: ParentPaymentTimelineEvent[];
  accessGranted?: {
    startsAt: string | null;
    endsAt: string | null;
    endsAtDisplay?: string | null;
  } | null;
};
