export type UserRole = 'admin' | 'sales';

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
  service: string;
  package: string;
  startDate: string;
  endDate: string;
  projectStatus: ProjectStatus;
  customerStatus: CustomerStatus;
  status: CustomerContractStatus; // Active | Onboarding | Completed | On Hold | Cancelled
  salesMemberId: string; // References SalesMember.memberId (e.g. "SM-001")
  salesMemberName: string;
  leadSource?: LeadSource;
  notes?: string;
  internalRemarks?: string;
  createdAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  memberId?: string;
  avatarUrl?: string;
  title?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Client Projects & Deliverables Types (Zero revenue, pure operational delivery)
export type ProjectStage = 'discovery' | 'in_progress' | 'review' | 'approval' | 'delivered';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ClientProject {
  id: string;
  projectId: string; // e.g. "PRJ-101"
  title: string;
  clientName: string;
  category: string; // e.g. "Cloud Modernization", "AI Web Suite"
  stage: ProjectStage;
  priority: ProjectPriority;
  progress: number; // 0 to 100
  dueDate: string;
  assignedMemberId: string;
  assignedMemberName: string;
  description?: string;
  createdAt: string;
}

// CRM Tasks & Follow-up Types
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskType = 'call' | 'meeting' | 'email' | 'followup' | 'proposal';

export interface CRMTask {
  id: string;
  taskId: string; // e.g. "TSK-001"
  title: string;
  company?: string;
  contactName?: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  salesMemberId: string;
  salesMemberName: string;
  notes?: string;
  createdAt: string;
}

export type AdminTab = 'dashboard' | 'projects' | 'tasks' | 'sales-members' | 'customers' | 'settings' | 'profile';
export type SalesTab = 'dashboard' | 'projects' | 'tasks' | 'my-customers' | 'add-customer' | 'profile' | 'settings';

