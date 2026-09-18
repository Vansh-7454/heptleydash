export type UserRole = 'admin' | 'sales';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  salesMemberId?: string; // e.g. "SM-001" for sales
  memberId?: string; // alias for salesMemberId
  avatarUrl?: string;
  designation?: string;
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

export type NotificationType =
  | 'customer_assigned'
  | 'followup_due'
  | 'followup_overdue'
  | 'lead_updated'
  | 'payment_received'
  | 'customer_status_changed';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
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
  | 'reports'
  | 'ai-assistant'
  | 'notifications'
  | 'settings'
  | 'profile';

export type SalesTab =
  | 'dashboard'
  | 'my-leads'
  | 'my-customers'
  | 'follow-ups'
  | 'activities'
  | 'ai-assistant'
  | 'notifications'
  | 'profile'
  | 'settings';
