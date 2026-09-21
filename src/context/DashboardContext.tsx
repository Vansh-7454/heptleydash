'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import {
  UserRole,
  UserProfile,
  SalesMember,
  Developer,
  Customer,
  Lead,
  FollowUp,
  Activity,
  Payment,
  Notification,
  Website,
  Domain,
  SalesQuestion,
  TechnicalNote,
  ToastMessage,
  AdminTab,
  SalesTab,
  DeveloperTab,
} from '@/types';
import { getToken } from '@/services/api';
import { authService } from '@/services/authService';
import { salesMemberService } from '@/services/salesMemberService';
import { websiteService } from '@/services/websiteService';
import { domainService } from '@/services/domainService';
import { salesQuestionService } from '@/services/salesQuestionService';
import { customerService } from '@/services/customerService';
import { leadService } from '@/services/leadService';
import { followUpService } from '@/services/followUpService';
import { activityService } from '@/services/activityService';
import { paymentService } from '@/services/paymentService';
import { notificationService } from '@/services/notificationService';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

const DEFAULT_USER_PROFILE: UserProfile = {
  id: '',
  name: 'User',
  email: '',
  role: 'admin',
  phone: '',
  designation: '',
};

function dedupeEntities<T extends { id?: string; [key: string]: any }>(list: T[], altKey?: string): T[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (!item) return false;
    const id = item.id || (item as any)._id;
    const alt = altKey ? item[altKey] : undefined;
    if (id && seen.has(String(id))) return false;
    if (alt && seen.has(String(alt))) return false;
    if (id) seen.add(String(id));
    if (alt) seen.add(String(alt));
    return true;
  });
}

interface DashboardContextType {
  // Auth & Session
  role: UserRole | null;
  userProfile: UserProfile;
  currentUser: UserProfile;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  // Navigation
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeSalesTab: SalesTab;
  setActiveSalesTab: (tab: SalesTab) => void;
  activeDeveloperTab: DeveloperTab;
  setActiveDeveloperTab: (tab: DeveloperTab) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;

  // Entity Collections
  salesMembers: SalesMember[];
  developers: Developer[];
  customers: Customer[];
  leads: Lead[];
  followUps: FollowUp[];
  activities: Activity[];
  payments: Payment[];
  websites: Website[];
  domains: Domain[];
  salesQuestions: SalesQuestion[];
  technicalNotes: TechnicalNote[];
  notifications: Notification[];
  unreadNotificationCount: number;

  // Dashboard Stats (from MongoDB)
  stats: DashboardStats | null;
  refreshStats: () => Promise<void>;

  // Role-filtered slices & metrics
  myCustomers: Customer[];
  myLeads: Lead[];
  myFollowUps: FollowUp[];
  myActivities: Activity[];
  myWebsites: Website[];
  myDomains: Domain[];
  myQuestions: SalesQuestion[];
  todayFollowUps: FollowUp[];
  overdueFollowUps: FollowUp[];
  upcomingFollowUps: FollowUp[];
  totalCustomers: number;
  activeCustomers: number;
  totalSalesMembers: number;
  totalDevelopers: number;
  openLeadsCount: number;
  pendingFollowUpsCount: number;
  activeWebsitesCount: number;
  activeDomainsCount: number;
  expiringDomainsCount: number;
  openQuestionsCount: number;

  // Deep Navigation
  detailedCustomerView: Customer | null;
  setDetailedCustomerView: (customer: Customer | null) => void;
  selectedAiEntity: { type: 'customer' | 'lead'; id: string; name: string } | null;
  setSelectedAiEntity: (entity: { type: 'customer' | 'lead'; id: string; name: string } | null) => void;

  // Modals & Entity Selection
  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
  editingMember: SalesMember | null;
  setEditingMember: (member: SalesMember | null) => void;

  isAddCustomerModalOpen: boolean;
  setIsAddCustomerModalOpen: (open: boolean) => void;
  editingCustomer: Customer | null;
  setEditingCustomer: (customer: Customer | null) => void;

  isAddLeadModalOpen: boolean;
  setIsAddLeadModalOpen: (open: boolean) => void;
  editingLead: Lead | null;
  setEditingLead: (lead: Lead | null) => void;

  isAddFollowUpModalOpen: boolean;
  setIsAddFollowUpModalOpen: (open: boolean) => void;
  editingFollowUp: FollowUp | null;
  setEditingFollowUp: (followUp: FollowUp | null) => void;

  isLogActivityModalOpen: boolean;
  setIsLogActivityModalOpen: (open: boolean) => void;

  isRecordPaymentModalOpen: boolean;
  setIsRecordPaymentModalOpen: (open: boolean) => void;

  // Conversion Modal
  convertingLead: Lead | null;
  setConvertingLead: (lead: Lead | null) => void;

  // CRUD Actions
  addSalesMember: (data: { name: string; email: string; phone: string; password?: string; status: 'Active' | 'Inactive' }) => Promise<SalesMember>;
  editSalesMember: (id: string, data: Partial<SalesMember>) => Promise<SalesMember>;
  toggleSalesMemberStatus: (id: string) => Promise<void>;

  addCustomer: (data: Omit<Customer, 'id' | 'customerId' | 'createdAt'>) => Promise<Customer>;
  editCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;

  addLead: (data: Omit<Lead, 'id' | 'leadId' | 'createdAt'>) => Promise<Lead>;
  editLead: (id: string, data: Partial<Lead>) => Promise<Lead>;
  convertLead: (leadId: string, customerData?: Partial<any>) => Promise<{ customer: Customer; lead: Lead }>;
  deleteLead: (id: string) => Promise<void>;

  addFollowUp: (data: Omit<FollowUp, 'id' | 'followUpId' | 'createdAt'>) => Promise<FollowUp>;
  editFollowUp: (id: string, data: Partial<FollowUp>) => Promise<FollowUp>;
  markFollowUpComplete: (id: string) => Promise<void>;
  cancelFollowUp: (id: string) => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;

  logActivity: (data: Omit<Activity, 'id' | 'timestamp'>) => Promise<Activity>;
  recordPayment: (data: Omit<Payment, 'id' | 'paymentRef' | 'createdAt'>) => Promise<Payment>;

  // Website & Domain CRUD
  addWebsite: (data: Partial<Website>) => Promise<Website>;
  createWebsite: (data: Partial<Website>) => Promise<Website>;
  editWebsite: (id: string, data: Partial<Website>) => Promise<Website>;
  updateWebsite: (id: string, data: Partial<Website>) => Promise<Website>;
  deleteWebsite: (id: string) => Promise<void>;

  addDomain: (data: Partial<Domain>) => Promise<Domain>;
  createDomain: (data: Partial<Domain>) => Promise<Domain>;
  editDomain: (id: string, data: Partial<Domain>) => Promise<Domain>;
  updateDomain: (id: string, data: Partial<Domain>) => Promise<Domain>;
  deleteDomain: (id: string) => Promise<void>;

  // Sales Questions CRUD
  askSalesQuestion: (data: {
    question: string;
    subject?: string;
    customerId?: string;
    websiteId?: string;
    priority?: any;
    assignedDeveloperId?: string;
  }) => Promise<SalesQuestion>;
  answerSalesQuestion: (id: string, answer: string, status?: any) => Promise<SalesQuestion>;
  updateSalesQuestion: (id: string, data: Partial<SalesQuestion>) => Promise<SalesQuestion>;
  deleteSalesQuestion: (id: string) => Promise<void>;

  // Technical Notes
  addTechnicalNote: (data: Omit<TechnicalNote, 'id' | 'updatedAt'>) => void;
  deleteTechnicalNote: (id: string) => void;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [role, setRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Navigation state
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [activeSalesTab, setActiveSalesTab] = useState<SalesTab>('dashboard');
  const [activeDeveloperTab, setActiveDeveloperTab] = useState<DeveloperTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Entity state
  const [salesMembers, setSalesMembers] = useState<SalesMember[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [salesQuestions, setSalesQuestions] = useState<SalesQuestion[]>([]);
  const [technicalNotes, setTechnicalNotes] = useState<TechnicalNote[]>([
    {
      id: 'note-1',
      title: 'Production Deployment Strategy',
      category: 'Deployment',
      content: 'Next.js 15 frontends deploy to Vercel edge runtime. Node Express API runs on port 5000 with MongoDB cluster failover.',
      updatedAt: '2026-09-18',
    },
    {
      id: 'note-2',
      title: 'DNS & SSL Automated Renewal Notes',
      category: 'Infrastructure',
      content: 'Domains expiring in <= 30 days trigger automated reminders. Cloudflare edge proxy handles SSL termination with Let\'s Encrypt 90-day certificates.',
      updatedAt: '2026-09-17',
    },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Detailed Customer View
  const [detailedCustomerView, setDetailedCustomerView] = useState<Customer | null>(null);
  const [selectedAiEntity, setSelectedAiEntity] = useState<{ type: 'customer' | 'lead'; id: string; name: string } | null>(null);

  // Modals state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SalesMember | null>(null);

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  const [isLogActivityModalOpen, setIsLogActivityModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

  // Lead Conversion State
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch live Dashboard Stats
  const refreshStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats();
      if (data) setStats(data);
    } catch (err) {
      console.warn('Failed to refresh dashboard stats', err);
    }
  }, []);

  // Load Initial Entities from Services
  const refreshData = useCallback(async () => {
    const session = authService.getCurrentSession();
    const token = getToken();

    // Do not attempt to query protected CRM endpoints when user is unauthenticated
    if (!session || !token) {
      return;
    }

    try {
      const salesMemberId = session.role === 'sales' ? session.user.salesMemberId : undefined;

      const [
        membersResult,
        customersResult,
        leadsResult,
        followUpsResult,
        activitiesResult,
        paymentsResult,
        websitesResult,
        domainsResult,
        questionsResult,
        notifsResult,
        statsResult,
      ] = await Promise.allSettled([
        salesMemberService.getAll(),
        customerService.getAll(),
        leadService.getAll(salesMemberId),
        followUpService.getAll(salesMemberId),
        activityService.getAll(salesMemberId),
        paymentService.getAll(salesMemberId),
        websiteService.getAll(),
        domainService.getAll(),
        salesQuestionService.getAll(),
        notificationService.getAll(),
        dashboardService.getStats(),
      ]);

      if (membersResult.status === 'fulfilled') setSalesMembers(dedupeEntities(membersResult.value, 'memberId'));
      if (customersResult.status === 'fulfilled') setCustomers(dedupeEntities(customersResult.value, 'customerId'));
      if (leadsResult.status === 'fulfilled') setLeads(dedupeEntities(leadsResult.value, 'leadId'));
      if (followUpsResult.status === 'fulfilled') setFollowUps(dedupeEntities(followUpsResult.value, 'followUpId'));
      if (activitiesResult.status === 'fulfilled') setActivities(dedupeEntities(activitiesResult.value));
      if (paymentsResult.status === 'fulfilled') setPayments(dedupeEntities(paymentsResult.value, 'paymentRef'));
      if (websitesResult.status === 'fulfilled') {
        const webs = websitesResult.value || [];
        setWebsites(dedupeEntities(webs, 'websiteId'));
        // Sync domains from websites
        const derivedDomains: Domain[] = webs
          .filter((w) => w.domainName)
          .map((w) => ({
            id: w.id || w.websiteId,
            domainId: `DOM-${w.websiteId.replace('WEB-', '')}`,
            domainName: w.domainName || '',
            websiteId: w.websiteId,
            websiteName: w.websiteName || w.name,
            websiteUrl: w.websiteUrl || w.url,
            customerId: w.customerId,
            customerName: w.customerName,
            startDate: w.domainStartDate || w.startDate || '',
            expiryDate: w.domainExpiryDate || '',
            daysRemaining: w.domainDaysRemaining ?? w.daysRemaining ?? 0,
            status: (w.domainStatus as any) || 'ACTIVE',
            registrar: w.domainRegistrar || '',
            autoRenew: w.domainAutoRenew ?? false,
            notes: w.domainNotes || '',
            createdAt: w.createdAt,
            updatedAt: w.updatedAt,
          }));
        setDomains(dedupeEntities(derivedDomains, 'domainName'));
      }
      if (domainsResult.status === 'fulfilled' && (!websitesResult || websitesResult.status !== 'fulfilled')) {
        setDomains(dedupeEntities(domainsResult.value, 'domainId'));
      }
      if (questionsResult.status === 'fulfilled') setSalesQuestions(dedupeEntities(questionsResult.value, 'questionId'));
      if (notifsResult.status === 'fulfilled') setNotifications(dedupeEntities(notifsResult.value));
      if (statsResult.status === 'fulfilled' && statsResult.value) setStats(statsResult.value);
    } catch (err) {
      console.warn('Failed to load initial CRM entities:', err);
    }
  }, []);

  // Initialize Session & Socket on Client Mount
  useEffect(() => {
    const session = authService.getCurrentSession();
    const token = getToken();

    if (session && token) {
      setRole(session.role);
      setUserProfile(session.user);
      if (session.role === 'sales') {
        setActiveSalesTab('dashboard');
      } else if (session.role === 'developer') {
        setActiveDeveloperTab('dashboard');
      } else {
        setActiveAdminTab('dashboard');
      }
      // Connect Socket.IO
      connectSocket();
      refreshData();
    }
  }, [refreshData]);

  // Real-time Socket.IO Event Listeners
  useEffect(() => {
    if (!role) return;

    const socket = getSocket() || connectSocket();
    if (!socket) return;

    // Customer events
    const handleCustomerCreated = (customer: Customer) => {
      setCustomers((prev) => dedupeEntities([customer, ...prev.filter((c) => c.customerId !== customer.customerId && c.id !== customer.id)], 'customerId'));
      refreshStats();
    };

    const handleCustomerUpdated = (customer: Customer) => {
      setCustomers((prev) => prev.map((c) => (c.customerId === customer.customerId || c.id === customer.id ? customer : c)));
      setDetailedCustomerView((prev) => (prev && (prev.customerId === customer.customerId || prev.id === customer.id) ? customer : prev));
      refreshStats();
    };

    const handleCustomerAssigned = (customer: Customer) => {
      setCustomers((prev) => prev.map((c) => (c.customerId === customer.customerId || c.id === customer.id ? customer : c)));
      refreshStats();
    };

    const handleCustomerDeleted = ({ id, customerId }: { id?: string; customerId?: string }) => {
      setCustomers((prev) => prev.filter((c) => (customerId ? c.customerId !== customerId : true) && (id ? c.id !== id : true)));
      setDetailedCustomerView((prev) => (prev && (prev.customerId === customerId || prev.id === id) ? null : prev));
      refreshStats();
    };

    // Lead events
    const handleLeadCreated = (lead: Lead) => {
      setLeads((prev) => dedupeEntities([lead, ...prev.filter((l) => l.leadId !== lead.leadId && l.id !== lead.id)], 'leadId'));
      refreshStats();
    };

    const handleLeadUpdated = (lead: Lead) => {
      setLeads((prev) => prev.map((l) => (l.leadId === lead.leadId || l.id === lead.id ? lead : l)));
      refreshStats();
    };

    const handleLeadConverted = ({ lead, customer }: { lead: Lead; customer: Customer }) => {
      setLeads((prev) => prev.map((l) => (l.leadId === lead.leadId || l.id === lead.id ? lead : l)));
      setCustomers((prev) => dedupeEntities([customer, ...prev.filter((c) => c.customerId !== customer.customerId && c.id !== customer.id)], 'customerId'));
      refreshStats();
    };

    // Follow-up events
    const handleFollowUpCreated = (followUp: FollowUp) => {
      setFollowUps((prev) => dedupeEntities([followUp, ...prev.filter((f) => f.followUpId !== followUp.followUpId && f.id !== followUp.id)], 'followUpId'));
      refreshStats();
    };

    const handleFollowUpUpdated = (followUp: FollowUp) => {
      setFollowUps((prev) => prev.map((f) => (f.followUpId === followUp.followUpId || f.id === followUp.id ? followUp : f)));
      refreshStats();
    };

    const handleFollowUpCompleted = (followUp: FollowUp) => {
      setFollowUps((prev) => prev.map((f) => (f.followUpId === followUp.followUpId || f.id === followUp.id ? followUp : f)));
      refreshStats();
    };

    const handleFollowUpCancelled = (followUp: FollowUp) => {
      setFollowUps((prev) => prev.map((f) => (f.followUpId === followUp.followUpId || f.id === followUp.id ? followUp : f)));
      refreshStats();
    };

    // Payment events
    const handlePaymentCreated = (payment: Payment) => {
      setPayments((prev) => dedupeEntities([payment, ...prev.filter((p) => p.paymentRef !== payment.paymentRef && p.id !== payment.id)], 'paymentRef'));
      customerService.getAll().then((data) => setCustomers(dedupeEntities(data, 'customerId'))).catch(() => {});
      refreshStats();
    };

    // Activity events
    const handleActivityCreated = (activity: Activity) => {
      setActivities((prev) => dedupeEntities([activity, ...prev.filter((a) => a.id !== activity.id)]));
    };

    // Notification events
    const handleNotificationNew = (notification: Notification) => {
      setNotifications((prev) => dedupeEntities([notification, ...prev.filter((n) => n.id !== notification.id)]));
      showToast(notification.title + ': ' + notification.message, 'info');
    };

    // Sales Member events
    const handleMemberCreated = (member: SalesMember) => {
      setSalesMembers((prev) => dedupeEntities([member, ...prev.filter((m) => m.memberId !== member.memberId && m.id !== member.id)], 'memberId'));
      refreshStats();
    };

    const handleMemberUpdated = (member: SalesMember) => {
      setSalesMembers((prev) => prev.map((m) => (m.memberId === member.memberId || m.id === member.id ? member : m)));
      refreshStats();
    };

    // Developer events
    const handleDeveloperCreated = (dev: Developer) => {
      setDevelopers((prev) => dedupeEntities([dev, ...prev.filter((d) => d.developerId !== dev.developerId && d.id !== dev.id)], 'developerId'));
      refreshStats();
    };

    const handleDeveloperUpdated = (dev: Developer) => {
      setDevelopers((prev) => prev.map((d) => (d.developerId === dev.developerId || d.id === dev.id ? dev : d)));
      refreshStats();
    };

    const handleDeveloperStatusChanged = (dev: { developerId: string; status: 'Active' | 'Inactive' }) => {
      setDevelopers((prev) => prev.map((d) => (d.developerId === dev.developerId ? { ...d, status: dev.status } : d)));
      refreshStats();
    };

    const handleDeveloperDeleted = (dev: { developerId: string }) => {
      setDevelopers((prev) => prev.filter((d) => d.developerId !== dev.developerId));
      refreshStats();
    };

    // Website events
    const handleWebsiteCreated = (web: Website) => {
      setWebsites((prev) => dedupeEntities([web, ...prev.filter((w) => w.websiteId !== web.websiteId && w.id !== web.id)], 'websiteId'));
      if (web.domainName) {
        setDomains((prev) => dedupeEntities([{
          id: web.id || web.websiteId,
          domainId: `DOM-${web.websiteId.replace('WEB-', '')}`,
          domainName: web.domainName || '',
          websiteId: web.websiteId,
          websiteName: web.websiteName || web.name,
          websiteUrl: web.websiteUrl || web.url,
          customerId: web.customerId,
          customerName: web.customerName,
          startDate: web.domainStartDate || web.startDate || '',
          expiryDate: web.domainExpiryDate || '',
          daysRemaining: web.domainDaysRemaining ?? web.daysRemaining ?? 0,
          status: (web.domainStatus as any) || 'ACTIVE',
          registrar: web.domainRegistrar || '',
          autoRenew: web.domainAutoRenew ?? false,
          notes: web.domainNotes || '',
          createdAt: web.createdAt,
          updatedAt: web.updatedAt,
        }, ...prev.filter((d) => d.websiteId !== web.websiteId)], 'domainName'));
      }
      refreshStats();
    };

    const handleWebsiteUpdated = (web: Website) => {
      setWebsites((prev) => prev.map((w) => (w.websiteId === web.websiteId || w.id === web.id ? web : w)));
      if (web.domainName) {
        setDomains((prev) => prev.map((d) => (d.websiteId === web.websiteId ? {
          ...d,
          domainName: web.domainName || '',
          startDate: web.domainStartDate || d.startDate,
          expiryDate: web.domainExpiryDate || d.expiryDate,
          daysRemaining: web.domainDaysRemaining ?? web.daysRemaining ?? d.daysRemaining,
          status: (web.domainStatus as any) || d.status,
          registrar: web.domainRegistrar || d.registrar,
          autoRenew: web.domainAutoRenew ?? d.autoRenew,
          notes: web.domainNotes || d.notes,
        } : d)));
      }
      refreshStats();
    };

    const handleWebsiteDeleted = (web: { websiteId: string }) => {
      setWebsites((prev) => prev.filter((w) => w.websiteId !== web.websiteId));
      setDomains((prev) => prev.filter((d) => d.websiteId !== web.websiteId));
      refreshStats();
    };


    // Domain events
    const handleDomainCreated = (dom: Domain) => {
      setDomains((prev) => dedupeEntities([dom, ...prev.filter((d) => d.domainId !== dom.domainId && d.id !== dom.id)], 'domainId'));
      refreshStats();
    };

    const handleDomainUpdated = (dom: Domain) => {
      setDomains((prev) => prev.map((d) => (d.domainId === dom.domainId || d.id === dom.id ? dom : d)));
      refreshStats();
    };

    const handleDomainExpiring = (dom: Domain) => {
      setDomains((prev) => prev.map((d) => (d.domainId === dom.domainId || d.id === dom.id ? { ...d, ...dom, status: 'EXPIRING_SOON' } : d)));
      refreshStats();
      showToast(`Domain ${dom.domainName} is expiring soon`, 'info');
    };

    const handleDomainExpired = (dom: Domain) => {
      setDomains((prev) => prev.map((d) => (d.domainId === dom.domainId || d.id === dom.id ? { ...d, ...dom, status: 'EXPIRED' } : d)));
      refreshStats();
      showToast(`Domain ${dom.domainName} has expired`, 'error');
    };

    const handleDomainDeleted = (dom: { domainId: string }) => {
      setDomains((prev) => prev.filter((d) => d.domainId !== dom.domainId));
      refreshStats();
    };

    // Sales Question events
    const handleQuestionCreated = (q: SalesQuestion) => {
      setSalesQuestions((prev) => dedupeEntities([q, ...prev.filter((item) => item.questionId !== q.questionId && item.id !== q.id)], 'questionId'));
      refreshStats();
    };

    const handleQuestionUpdated = (q: SalesQuestion) => {
      setSalesQuestions((prev) => prev.map((item) => (item.questionId === q.questionId || item.id === q.id ? q : item)));
      refreshStats();
    };

    const handleQuestionAnswered = (q: SalesQuestion) => {
      setSalesQuestions((prev) => prev.map((item) => (item.questionId === q.questionId || item.id === q.id ? q : item)));
      refreshStats();
      showToast(`Question ${q.questionId} answered by ${q.answeredBy}`, 'info');
    };

    const handleQuestionDeleted = (q: { id?: string; questionId?: string }) => {
      setSalesQuestions((prev) =>
        prev.filter((item) => {
          if (q.questionId && (item.questionId === q.questionId || item.id === q.questionId)) return false;
          if (q.id && (item.id === q.id || item.questionId === q.id)) return false;
          return true;
        })
      );
      // Immediately purge notifications associated with this question
      const target = q.questionId || q.id;
      if (target) {
        setNotifications((prev) =>
          prev.filter(
            (n) =>
              n.targetId !== target &&
              n.targetId !== q.id &&
              n.targetId !== q.questionId &&
              (!q.questionId || !n.title.includes(q.questionId))
          )
        );
      }
      refreshStats();
    };

    const handleNotificationDeleted = (data: { targetId?: string; id?: string }) => {
      if (data?.targetId || data?.id) {
        setNotifications((prev) =>
          prev.filter(
            (n) =>
              n.id !== data.id &&
              n.targetId !== data.targetId &&
              (!data.targetId || !n.title.includes(data.targetId))
          )
        );
      }
    };

    socket.on('customer:created', handleCustomerCreated);
    socket.on('customer:updated', handleCustomerUpdated);
    socket.on('customer:assigned', handleCustomerAssigned);
    socket.on('customer:deleted', handleCustomerDeleted);
    socket.on('lead:created', handleLeadCreated);
    socket.on('lead:updated', handleLeadUpdated);
    socket.on('lead:converted', handleLeadConverted);
    socket.on('followup:created', handleFollowUpCreated);
    socket.on('followup:updated', handleFollowUpUpdated);
    socket.on('followup:completed', handleFollowUpCompleted);
    socket.on('followup:cancelled', handleFollowUpCancelled);
    socket.on('payment:created', handlePaymentCreated);
    socket.on('activity:created', handleActivityCreated);
    socket.on('notification:new', handleNotificationNew);
    socket.on('salesMember:created', handleMemberCreated);
    socket.on('salesMember:updated', handleMemberUpdated);
    socket.on('developer:created', handleDeveloperCreated);
    socket.on('developer:updated', handleDeveloperUpdated);
    socket.on('developer:statusChanged', handleDeveloperStatusChanged);
    socket.on('developer:deleted', handleDeveloperDeleted);
    socket.on('website:created', handleWebsiteCreated);
    socket.on('website:updated', handleWebsiteUpdated);
    socket.on('website:deleted', handleWebsiteDeleted);
    socket.on('domain:created', handleDomainCreated);
    socket.on('domain:updated', handleDomainUpdated);
    socket.on('domain:expiring', handleDomainExpiring);
    socket.on('domain:expired', handleDomainExpired);
    socket.on('domain:deleted', handleDomainDeleted);
    socket.on('question:created', handleQuestionCreated);
    socket.on('question:updated', handleQuestionUpdated);
    socket.on('question:answered', handleQuestionAnswered);
    socket.on('question:deleted', handleQuestionDeleted);
    socket.on('notification:deleted', handleNotificationDeleted);

    return () => {
      socket.off('customer:created', handleCustomerCreated);
      socket.off('customer:updated', handleCustomerUpdated);
      socket.off('customer:assigned', handleCustomerAssigned);
      socket.off('customer:deleted', handleCustomerDeleted);
      socket.off('lead:created', handleLeadCreated);
      socket.off('lead:updated', handleLeadUpdated);
      socket.off('lead:converted', handleLeadConverted);
      socket.off('followup:created', handleFollowUpCreated);
      socket.off('followup:updated', handleFollowUpUpdated);
      socket.off('followup:completed', handleFollowUpCompleted);
      socket.off('followup:cancelled', handleFollowUpCancelled);
      socket.off('payment:created', handlePaymentCreated);
      socket.off('activity:created', handleActivityCreated);
      socket.off('notification:new', handleNotificationNew);
      socket.off('salesMember:created', handleMemberCreated);
      socket.off('salesMember:updated', handleMemberUpdated);
      socket.off('developer:created', handleDeveloperCreated);
      socket.off('developer:updated', handleDeveloperUpdated);
      socket.off('developer:statusChanged', handleDeveloperStatusChanged);
      socket.off('developer:deleted', handleDeveloperDeleted);
      socket.off('website:created', handleWebsiteCreated);
      socket.off('website:updated', handleWebsiteUpdated);
      socket.off('website:deleted', handleWebsiteDeleted);
      socket.off('domain:created', handleDomainCreated);
      socket.off('domain:updated', handleDomainUpdated);
      socket.off('domain:expiring', handleDomainExpiring);
      socket.off('domain:expired', handleDomainExpired);
      socket.off('domain:deleted', handleDomainDeleted);
      socket.off('question:created', handleQuestionCreated);
      socket.off('question:updated', handleQuestionUpdated);
      socket.off('question:answered', handleQuestionAnswered);
      socket.off('question:deleted', handleQuestionDeleted);
      socket.off('notification:deleted', handleNotificationDeleted);
    };
  }, [role, refreshStats, showToast]);

  // Auth actions
  const login = async (email: string, password?: string) => {
    const session = await authService.login(email, password);
    setRole(session.role);
    setUserProfile(session.user);
    setDetailedCustomerView(null);

    if (session.role === 'admin') {
      setActiveAdminTab('dashboard');
    } else if (session.role === 'developer') {
      setActiveDeveloperTab('dashboard');
    } else {
      setActiveSalesTab('dashboard');
    }

    disconnectSocket();
    connectSocket();
    await refreshData();
    showToast(`Signed in as ${session.user.name} (${session.role === 'admin' ? 'Admin' : session.role === 'developer' ? 'Developer' : 'Sales Member'})`, 'success');
  };

  const logout = async () => {
    await authService.logout();
    disconnectSocket();
    setRole(null);
    setUserProfile(DEFAULT_USER_PROFILE);
    setDetailedCustomerView(null);
    setSalesMembers([]);
    setDevelopers([]);
    setCustomers([]);
    setLeads([]);
    setFollowUps([]);
    setActivities([]);
    setPayments([]);
    setWebsites([]);
    setDomains([]);
    setSalesQuestions([]);
    setNotifications([]);
    setStats(null);
    setActiveAdminTab('dashboard');
    setActiveSalesTab('dashboard');
    setActiveDeveloperTab('dashboard');
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
    showToast('Profile updated', 'success');
  };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // Sales Member CRUD
  const addSalesMember = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    status: 'Active' | 'Inactive';
  }) => {
    const created = await salesMemberService.create(data);
    setSalesMembers((prev) => dedupeEntities([created, ...prev.filter((m) => m.memberId !== created.memberId && m.id !== created.id)], 'memberId'));
    showToast(`Sales Member ${created.name} (${created.memberId}) created`, 'success');
    return created;
  };

  const editSalesMember = async (id: string, data: Partial<SalesMember>) => {
    const updated = await salesMemberService.update(id, data);
    setSalesMembers((prev) => prev.map((m) => (m.id === id || m.memberId === id ? updated : m)));
    showToast(`Sales Member ${updated.name} updated`, 'success');
    return updated;
  };

  const toggleSalesMemberStatus = async (id: string) => {
    const updated = await salesMemberService.toggleStatus(id);
    setSalesMembers((prev) => prev.map((m) => (m.id === id || m.memberId === id ? updated : m)));
    showToast(`Status updated to ${updated.status}`, 'info');
  };

  // Website CRUD
  const addWebsite = async (data: Partial<Website>) => {
    const created = await websiteService.create(data);
    setWebsites((prev) => dedupeEntities([created, ...prev.filter((w) => w.websiteId !== created.websiteId && w.id !== created.id)], 'websiteId'));
    await refreshStats();
    showToast(`Website ${created.websiteName} (${created.websiteId}) registered`, 'success');
    return created;
  };

  const createWebsite = addWebsite;

  const editWebsite = async (id: string, data: Partial<Website>) => {
    const updated = await websiteService.update(id, data);
    setWebsites((prev) => prev.map((w) => (w.id === id || w.websiteId === id ? updated : w)));
    await refreshStats();
    showToast(`Website ${updated.websiteName} updated`, 'success');
    return updated;
  };

  const updateWebsite = editWebsite;

  const deleteWebsite = async (id: string) => {
    await websiteService.delete(id);
    setWebsites((prev) => prev.filter((w) => w.id !== id && w.websiteId !== id));
    await refreshStats();
    showToast(`Website record deleted`, 'info');
  };

  // Domain CRUD
  const addDomain = async (data: Partial<Domain>) => {
    const created = await domainService.create(data);
    setDomains((prev) => dedupeEntities([created, ...prev.filter((d) => d.domainId !== created.domainId && d.id !== created.id)], 'domainId'));
    await refreshStats();
    showToast(`Domain ${created.domainName} (${created.domainId}) added`, 'success');
    return created;
  };

  const createDomain = addDomain;

  const editDomain = async (id: string, data: Partial<Domain>) => {
    const updated = await domainService.update(id, data);
    setDomains((prev) => prev.map((d) => (d.id === id || d.domainId === id ? updated : d)));
    await refreshStats();
    showToast(`Domain ${updated.domainName} updated`, 'success');
    return updated;
  };

  const updateDomain = editDomain;

  const deleteDomain = async (id: string) => {
    await domainService.delete(id);
    setDomains((prev) => prev.filter((d) => d.id !== id && d.domainId !== id));
    await refreshStats();
    showToast(`Domain record deleted`, 'info');
  };

  // Sales Questions CRUD
  const askSalesQuestion = async (data: {
    question: string;
    subject?: string;
    customerId?: string;
    websiteId?: string;
    priority?: any;
    assignedDeveloperId?: string;
  }) => {
    const created = await salesQuestionService.create(data);
    setSalesQuestions((prev) => dedupeEntities([created, ...prev.filter((q) => q.questionId !== created.questionId && q.id !== created.id)], 'questionId'));
    await refreshStats();
    showToast(`Question ${created.questionId} submitted to technical team`, 'success');
    return created;
  };

  const answerSalesQuestion = async (id: string, answer: string, status: any = 'ANSWERED') => {
    const updated = await salesQuestionService.answer(id, answer, status);
    setSalesQuestions((prev) => prev.map((q) => (q.id === id || q.questionId === id ? updated : q)));
    await refreshStats();
    showToast(`Answer submitted for ${updated.questionId}`, 'success');
    return updated;
  };

  const updateSalesQuestion = async (id: string, data: Partial<SalesQuestion>) => {
    const updated = await salesQuestionService.update(id, data);
    setSalesQuestions((prev) => prev.map((q) => (q.id === id || q.questionId === id ? updated : q)));
    await refreshStats();
    showToast(`Question ${updated.questionId} updated`, 'info');
    return updated;
  };

  const deleteSalesQuestion = async (id: string) => {
    await salesQuestionService.delete(id);
    setSalesQuestions((prev) => prev.filter((q) => q.id !== id && q.questionId !== id));
    setNotifications((prev) =>
      prev.filter((n) => n.targetId !== id && !n.title.includes(id))
    );
    await refreshStats();
    showToast(`Question removed`, 'info');
  };

  // Technical Notes
  const addTechnicalNote = (data: Omit<TechnicalNote, 'id' | 'updatedAt'>) => {
    const newNote: TechnicalNote = {
      ...data,
      id: `note_${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTechnicalNotes((prev) => [newNote, ...prev]);
    showToast(`Note "${newNote.title}" saved`, 'success');
  };

  const deleteTechnicalNote = (id: string) => {
    setTechnicalNotes((prev) => prev.filter((n) => n.id !== id));
    showToast(`Note deleted`, 'info');
  };

  // Customer CRUD
  const addCustomer = async (data: Omit<Customer, 'id' | 'customerId' | 'createdAt'>) => {
    const created = await customerService.create(data);
    setCustomers((prev) => dedupeEntities([created, ...prev.filter((c) => c.customerId !== created.customerId && c.id !== created.id)], 'customerId'));
    await refreshStats();
    showToast(`Customer ${created.name} onboarded`, 'success');
    return created;
  };

  const editCustomer = async (id: string, data: Partial<Customer>) => {
    const updated = await customerService.update(id, data);
    setCustomers((prev) => prev.map((c) => (c.id === id || c.customerId === id ? updated : c)));
    if (detailedCustomerView && (detailedCustomerView.id === id || detailedCustomerView.customerId === id)) {
      setDetailedCustomerView(updated);
    }
    await refreshStats();
    showToast(`Customer ${updated.name} updated`, 'success');
    return updated;
  };

  const deleteCustomer = async (id: string) => {
    await customerService.delete(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id && c.customerId !== id));
    if (detailedCustomerView && (detailedCustomerView.id === id || detailedCustomerView.customerId === id)) {
      setDetailedCustomerView(null);
    }
    await refreshStats();
    showToast('Customer removed', 'info');
  };

  // Lead CRUD
  const addLead = async (data: Omit<Lead, 'id' | 'leadId' | 'createdAt'>) => {
    const created = await leadService.create(data);
    setLeads((prev) => dedupeEntities([created, ...prev.filter((l) => l.leadId !== created.leadId && l.id !== created.id)], 'leadId'));
    await refreshStats();
    showToast(`Lead ${created.name} added to pipeline`, 'success');
    return created;
  };

  const editLead = async (id: string, data: Partial<Lead>) => {
    const updated = await leadService.update(id, data);
    setLeads((prev) => prev.map((l) => (l.id === id || l.leadId === id ? updated : l)));
    await refreshStats();
    showToast(`Lead ${updated.name} updated`, 'success');
    return updated;
  };

  const convertLead = async (leadId: string, customerData?: Partial<any>) => {
    const result = await leadService.convert(leadId, customerData);
    setLeads((prev) => prev.map((l) => (l.id === leadId || l.leadId === leadId ? result.lead : l)));
    setCustomers((prev) => dedupeEntities([result.customer, ...prev.filter((c) => c.customerId !== result.customer.customerId && c.id !== result.customer.id)], 'customerId'));
    await refreshStats();
    showToast(`Lead ${result.lead.name} converted to Customer ${result.customer.customerId}!`, 'success');
    return result;
  };

  const deleteLead = async (id: string) => {
    await leadService.delete(id);
    setLeads((prev) => prev.filter((l) => l.id !== id && l.leadId !== id));
    await refreshStats();
    showToast('Lead removed', 'info');
  };

  // Follow-up CRUD
  const addFollowUp = async (data: Omit<FollowUp, 'id' | 'followUpId' | 'createdAt'>) => {
    const created = await followUpService.create(data);
    setFollowUps((prev) => dedupeEntities([created, ...prev.filter((f) => f.followUpId !== created.followUpId && f.id !== created.id)], 'followUpId'));
    await refreshStats();
    showToast(`Follow-up scheduled for ${created.date}`, 'success');
    return created;
  };

  const editFollowUp = async (id: string, data: Partial<FollowUp>) => {
    const updated = await followUpService.update(id, data);
    setFollowUps((prev) => prev.map((f) => (f.id === id || f.followUpId === id ? updated : f)));
    showToast('Follow-up updated', 'success');
    return updated;
  };

  const markFollowUpComplete = async (id: string) => {
    const updated = await followUpService.complete(id);
    setFollowUps((prev) => prev.map((f) => (f.id === id || f.followUpId === id ? updated : f)));
    await refreshStats();
    showToast('Follow-up marked as Completed', 'success');
  };

  const cancelFollowUp = async (id: string) => {
    const updated = await followUpService.cancel(id);
    setFollowUps((prev) => prev.map((f) => (f.id === id || f.followUpId === id ? updated : f)));
    await refreshStats();
    showToast('Follow-up marked as Cancelled', 'info');
  };

  const deleteFollowUp = async (id: string) => {
    await followUpService.delete(id);
    setFollowUps((prev) => prev.filter((f) => f.id !== id && f.followUpId !== id));
    await refreshStats();
    showToast('Follow-up removed', 'info');
  };

  // Activity & Payment
  const logActivity = async (data: Omit<Activity, 'id' | 'timestamp'>) => {
    const created = await activityService.log(data);
    setActivities((prev) => dedupeEntities([created, ...prev.filter((a) => a.id !== created.id)]));
    showToast('Activity logged', 'success');
    return created;
  };

  const recordPayment = async (data: Omit<Payment, 'id' | 'paymentRef' | 'createdAt'>) => {
    const created = await paymentService.create(data);
    setPayments((prev) => dedupeEntities([created, ...prev.filter((p) => p.paymentRef !== created.paymentRef && p.id !== created.id)], 'paymentRef'));

    // Backend automatically recalculates customer ledger and logs activity
    try {
      const [updatedCustomers, updatedActivities] = await Promise.all([
        customerService.getAll(),
        activityService.getAll(),
      ]);
      setCustomers(dedupeEntities(updatedCustomers, 'customerId'));
      setActivities(dedupeEntities(updatedActivities));
      await refreshStats();
    } catch (e) {
      console.warn('Could not sync updated balance list:', e);
    }

    showToast(`Payment of ₹${created.amountPaid.toLocaleString('en-IN')} recorded`, 'success');
    return created;
  };

  // Notification actions
  const markNotificationRead = async (id: string) => {
    const updated = await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const markAllNotificationsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Computed & Filtered Slices
  const unreadNotificationCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const mySalesMemberId = userProfile.salesMemberId || userProfile.memberId || 'SM-001';

  const myCustomers = useMemo(
    () => dedupeEntities(customers.filter((c) => c.salesMemberId === mySalesMemberId), 'customerId'),
    [customers, mySalesMemberId]
  );

  const myLeads = useMemo(
    () =>
      dedupeEntities(
        leads.filter(
          (l) =>
            l.assignedSalesMemberId === mySalesMemberId ||
            (l as any).salesMemberId === mySalesMemberId
        ),
        'leadId'
      ),
    [leads, mySalesMemberId]
  );

  const myFollowUps = useMemo(
    () =>
      dedupeEntities(
        followUps.filter(
          (f) =>
            f.assignedSalesMemberId === mySalesMemberId ||
            (f as any).salesMemberId === mySalesMemberId
        ),
        'followUpId'
      ),
    [followUps, mySalesMemberId]
  );

  const myActivities = useMemo(
    () =>
      dedupeEntities(
        activities.filter(
          (a) =>
            a.salesMemberId === mySalesMemberId ||
            (a as any).assignedSalesMemberId === mySalesMemberId ||
            a.userId === userProfile.id ||
            a.userName === userProfile.name
        )
      ),
    [activities, mySalesMemberId, userProfile.id, userProfile.name]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const todayFollowUps = useMemo(() => {
    const source = role === 'sales' ? myFollowUps : followUps;
    return source.filter((f) => f.date === todayStr && f.status !== 'Completed' && f.status !== 'Cancelled');
  }, [role, myFollowUps, followUps, todayStr]);

  const overdueFollowUps = useMemo(() => {
    const source = role === 'sales' ? myFollowUps : followUps;
    return source.filter((f) => (f.date < todayStr || f.status === 'Overdue') && f.status !== 'Completed' && f.status !== 'Cancelled');
  }, [role, myFollowUps, followUps, todayStr]);

  const upcomingFollowUps = useMemo(() => {
    const source = role === 'sales' ? myFollowUps : followUps;
    return source.filter((f) => f.date > todayStr && f.status !== 'Completed' && f.status !== 'Cancelled');
  }, [role, myFollowUps, followUps, todayStr]);

  const totalCustomers = stats?.totalCustomers ?? customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'Active' || c.status === 'Onboarding').length;
  const totalSalesMembers = stats?.totalSalesMembers ?? salesMembers.length;
  const totalDevelopers = stats?.totalDevelopers ?? developers.length;
  const openLeadsCount = (role === 'sales' ? stats?.myOpenLeads : stats?.openLeads) ?? leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const pendingFollowUpsCount = (role === 'sales' ? stats?.pendingFollowUps : stats?.pendingFollowUps) ?? followUps.filter((f) => f.status !== 'Completed' && f.status !== 'Cancelled').length;

  const myWebsites = useMemo(() => websites, [websites]);

  const myDomains = useMemo(() => domains, [domains]);

  const myQuestions = useMemo(() => {
    if (role === 'sales') {
      const myId = userProfile.salesMemberId || userProfile.memberId;
      return salesQuestions.filter((q) => q.askedBySalesMemberId === myId || (q.askedBy === myId && !q.askedBySalesMemberId));
    }
    return salesQuestions;
  }, [salesQuestions, role, userProfile.salesMemberId, userProfile.memberId]);

  const activeWebsitesCount = stats?.activeWebsites ?? websites.filter((w) => w.status === 'ACTIVE' || w.status === 'LIVE').length;
  const activeDomainsCount = stats?.activeDomains ?? domains.filter((d) => d.status === 'ACTIVE').length;
  const expiringDomainsCount = stats?.expiringDomains ?? domains.filter((d) => d.status === 'EXPIRING_SOON').length;
  const openQuestionsCount = stats?.openSalesQuestions ?? salesQuestions.filter((q) => q.status === 'OPEN' || q.status === 'IN_PROGRESS').length;

  return (
    <DashboardContext.Provider
      value={{
        role,
        userProfile,
        currentUser: userProfile,
        login,
        logout,
        updateUserProfile,
        activeAdminTab,
        setActiveAdminTab,
        activeSalesTab,
        setActiveSalesTab,
        activeDeveloperTab,
        setActiveDeveloperTab,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileNavOpen,
        setIsMobileNavOpen,
        salesMembers,
        developers,
        customers,
        leads,
        followUps,
        activities,
        payments,
        websites,
        domains,
        salesQuestions,
        technicalNotes,
        notifications,
        unreadNotificationCount,
        stats,
        refreshStats,
        myCustomers,
        myLeads,
        myFollowUps,
        myActivities,
        myWebsites,
        myDomains,
        myQuestions,
        todayFollowUps,
        overdueFollowUps,
        upcomingFollowUps,
        totalCustomers,
        activeCustomers,
        totalSalesMembers,
        totalDevelopers,
        openLeadsCount,
        pendingFollowUpsCount,
        activeWebsitesCount,
        activeDomainsCount,
        expiringDomainsCount,
        openQuestionsCount,
        detailedCustomerView,
        setDetailedCustomerView,
        selectedAiEntity,
        setSelectedAiEntity,
        isAddMemberModalOpen,
        setIsAddMemberModalOpen,
        editingMember,
        setEditingMember,
        isAddCustomerModalOpen,
        setIsAddCustomerModalOpen,
        editingCustomer,
        setEditingCustomer,
        isAddLeadModalOpen,
        setIsAddLeadModalOpen,
        editingLead,
        setEditingLead,
        isAddFollowUpModalOpen,
        setIsAddFollowUpModalOpen,
        editingFollowUp,
        setEditingFollowUp,
        isLogActivityModalOpen,
        setIsLogActivityModalOpen,
        isRecordPaymentModalOpen,
        setIsRecordPaymentModalOpen,
        convertingLead,
        setConvertingLead,
        addSalesMember,
        editSalesMember,
        toggleSalesMemberStatus,
        addCustomer,
        editCustomer,
        deleteCustomer,
        addLead,
        editLead,
        convertLead,
        deleteLead,
        addFollowUp,
        editFollowUp,
        markFollowUpComplete,
        cancelFollowUp,
        deleteFollowUp,
        logActivity,
        recordPayment,
        addWebsite,
        createWebsite,
        editWebsite,
        updateWebsite,
        deleteWebsite,
        addDomain,
        createDomain,
        editDomain,
        updateDomain,
        deleteDomain,
        askSalesQuestion,
        answerSalesQuestion,
        updateSalesQuestion,
        deleteSalesQuestion,
        addTechnicalNote,
        deleteTechnicalNote,
        markNotificationRead,
        markAllNotificationsRead,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
