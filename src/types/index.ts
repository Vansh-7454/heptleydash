export type UserRole = 'admin' | 'sales' | 'developer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  salesMemberId?: string; // e.g. "SM-001" for sales
  developerId?: string; // e.g. "DEV-001" for developer
  memberId?: string; // alias
  avatarUrl?: string;
  designation?: string;
}

export interface Developer {
  id: string;
  developerId: string; // e.g. "DEV-001"
  name: string;
  email: string;
  phone: string;
  role: 'developer';
  status: 'Active' | 'Inactive';
  specialization?: string;
  assignedWebsitesCount?: number;
  assignedDomainsCount?: number;
  assignedQuestionsCount?: number;
  createdAt: string;
}

export interface SalesMember {
  id: string;
  memberId: string; // e.g. "SM-001"
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  customerCount: number;
  joiningDate: string;
  createdAt: string;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold';
export type CustomerStatus = 'Active' | 'Inactive' | 'Lead';
export type CustomerContractStatus = 'Active' | 'Onboarding' | 'Completed' | 'On Hold' | 'Cancelled';

export type LeadSource =
  | 'Direct Referral'
  | 'Website Inquiry'
  | 'Cold Outreach'
  | 'Partner Network'
  | 'LinkedIn'
  | 'Google Search';

export interface Customer {
  id: string;
  customerId: string; // e.g. "CUS-0001"
  name: string;
  company: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  location: string;
  website?: string;
  service: string;
  package: string;
  startDate: string;
  endDate: string;
  projectStatus: ProjectStatus;
  customerStatus: CustomerStatus;
  status: CustomerContractStatus;
  salesMemberId: string; // References SalesMember.memberId (e.g. "SM-001")
  salesMemberName: string;
  leadSource: LeadSource;
  dealValue: number;
  discount: number;
  finalAmount: number;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  paymentMethod: string;
  lastPaymentDate?: string;
  lastActivityDate?: string;
  notes?: string;
  internalRemarks?: string;
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  leadId: string; // e.g. "LED-0001"
  name: string;
  company: string;
  email: string;
  phone: string;
  interestedService: string;
  source: LeadSource | string;
  status: LeadStatus;
  assignedSalesMemberId: string;
  assignedSalesMemberName: string;
  dealEstimate?: number;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  isConverted?: boolean;
  convertedCustomerId?: string;
  createdAt: string;
}

export type FollowUpType = 'Call' | 'Email' | 'Meeting' | 'WhatsApp' | 'Other';
export type FollowUpStatus = 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled' | 'Cancelled';

export interface FollowUp {
  id: string;
  followUpId: string; // e.g. "FLW-0001"
  title: string;
  entityType: 'customer' | 'lead';
  entityId: string;
  entityName: string;
  company: string;
  assignedSalesMemberId: string;
  assignedSalesMemberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: FollowUpType;
  note: string;
  status: FollowUpStatus;
  createdAt: string;
}

export type ActivityType =
  | 'Call'
  | 'Email'
  | 'Meeting'
  | 'Note'
  | 'Follow-up'
  | 'Payment'
  | 'Status Change'
  | 'Customer Created'
  | 'Lead Created';

export interface Activity {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userRole: UserRole;
  salesMemberId?: string; // e.g. "SM-001"
  entityType?: 'customer' | 'lead' | 'payment';
  entityId?: string;
  entityName?: string;
  company?: string;
  type: ActivityType;
  description: string;
}

export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Overdue';
export type PaymentMethod = 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Cash' | 'Cheque';

export interface Payment {
  id: string;
  paymentRef: string; // e.g. "INV-2026-001"
  customerId: string;
  customerName: string;
  company: string;
  totalAmount: number;
  amountPaid: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export type WebsiteStatus =
  | 'ACTIVE'
  | 'LIVE'
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'MAINTENANCE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'ARCHIVED';

export interface Website {
  id: string;
  websiteId: string; // e.g. "WEB-0001"
  websiteName: string;
  websiteUrl: string;
  name?: string;
  url?: string;
  projectType: string;
  customerId?: string;
  customerName?: string;
  status: WebsiteStatus;
  assignedDeveloperId?: string;
  assignedDeveloperName?: string;
  assignedDate?: string;
  startDate?: string;
  hostingProvider?: string;
  hostingNotes?: string;
  repositoryUrl?: string;
  deploymentUrl?: string;
  technologyStack?: string;
  description?: string;
  internalNotes?: string;
  domainCount?: number;

  // Integrated Domain Information (managed as part of Website record)
  domainName?: string;
  domainStartDate?: string;
  domainExpiryDate?: string;
  domainDaysRemaining?: number | null;
  daysRemaining?: number | null;
  domainStatus?: DomainStatus;
  domainRegistrar?: string;
  domainAutoRenew?: boolean;
  domainNotes?: string;
  customerCompany?: string;

  // Client & Domain Document (PDF with small size in KB)
  domainDocumentPdf?: string;
  domainDocumentName?: string;
  domainDocumentSizeKb?: number;

  createdAt: string;
  updatedAt: string;
}


export type DomainStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface Domain {
  id: string;
  domainId: string; // e.g. "DOM-0001"
  domainName: string;
  websiteId: string; // e.g. "WEB-0001"
  websiteName?: string;
  websiteUrl?: string;
  customerId?: string;
  customerName?: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  daysRemaining: number;
  status: DomainStatus;
  registrar: string;
  autoRenew: boolean;
  assignedDeveloperId?: string;
  assignedDeveloperName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SalesQuestionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SalesQuestionStatus = 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';

export interface SalesQuestion {
  id: string;
  questionId: string; // e.g. "Q-0001"
  subject?: string;
  question: string;
  customerId?: string;
  customerName?: string;
  websiteId?: string;
  websiteName?: string;
  websiteUrl?: string;
  askedBySalesMemberId?: string;
  askedBy?: string;
  askedByName?: string;
  assignedDeveloperId?: string;
  assignedDeveloperName?: string;
  priority: SalesQuestionPriority;
  status: SalesQuestionStatus;
  answer?: string;
  answeredBy?: string;
  answeredByName?: string;
  answeredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TechnicalNote {
  id: string;
  title: string;
  category: 'Infrastructure' | 'Architecture' | 'API' | 'Deployment' | 'Security';
  content: string;
  websiteId?: string;
  updatedAt: string;
}

export type NotificationType =
  | 'customer_assigned'
  | 'followup_due'
  | 'followup_overdue'
  | 'lead_updated'
  | 'payment_received'
  | 'customer_status_changed'
  | 'domain_expiring_soon'
  | 'domain_expired'
  | 'new_sales_question'
  | 'question_answered'
  | 'website_created'
  | 'website_updated';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  createdAt?: string;
  read: boolean;
  targetTab?: string;
  targetId?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type AdminTab =
  | 'dashboard'
  | 'sales-members'
  | 'customers'
  | 'leads'
  | 'follow-ups'
  | 'activities'
  | 'payments'
  | 'websites-domains'
  | 'sales-questions'
  | 'notifications'
  | 'reports'
  | 'ai-assistant'
  | 'settings'
  | 'profile';

export type SalesTab =
  | 'dashboard'
  | 'my-customers'
  | 'my-leads'
  | 'follow-ups'
  | 'activities'
  | 'payments'
  | 'sales-questions'
  | 'websites-domains'
  | 'ai-assistant'
  | 'notifications'
  | 'profile'
  | 'settings';

export type DeveloperTab =
  | 'dashboard'
  | 'websites-domains'
  | 'sales-questions'
  | 'notifications'
  | 'profile'
  | 'settings';

