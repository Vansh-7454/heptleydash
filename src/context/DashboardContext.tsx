'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import {
  UserRole,
  UserProfile,
  SalesMember,
  Customer,
  Lead,
  FollowUp,
  Activity,
  Payment,
  Notification,
  ToastMessage,
  AdminTab,
  SalesTab,
} from '@/types';
import { getToken } from '@/services/api';
import { authService } from '@/services/authService';
import { salesMemberService } from '@/services/salesMemberService';
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
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  // Navigation
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeSalesTab: SalesTab;
  setActiveSalesTab: (tab: SalesTab) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;

  // Entity Collections
  salesMembers: SalesMember[];
  customers: Customer[];
  leads: Lead[];
  followUps: FollowUp[];
  activities: Activity[];
  payments: Payment[];
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
  todayFollowUps: FollowUp[];
  overdueFollowUps: FollowUp[];
  upcomingFollowUps: FollowUp[];
  totalCustomers: number;
  activeCustomers: number;
  totalSalesMembers: number;
  openLeadsCount: number;
  pendingFollowUpsCount: number;

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Entity state
  const [salesMembers, setSalesMembers] = useState<SalesMember[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
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
        notifsResult,
        statsResult,
      ] = await Promise.allSettled([
        session.role === 'admin' ? salesMemberService.getAll() : Promise.resolve([]),
        customerService.getAll(salesMemberId),
        leadService.getAll(salesMemberId),
        followUpService.getAll(salesMemberId),
        activityService.getAll(salesMemberId),
        paymentService.getAll(salesMemberId),
        notificationService.getAll(),
        dashboardService.getStats(),
      ]);

      if (membersResult.status === 'fulfilled') setSalesMembers(dedupeEntities(membersResult.value, 'memberId'));
      if (customersResult.status === 'fulfilled') setCustomers(dedupeEntities(customersResult.value, 'customerId'));
      if (leadsResult.status === 'fulfilled') setLeads(dedupeEntities(leadsResult.value, 'leadId'));
      if (followUpsResult.status === 'fulfilled') setFollowUps(dedupeEntities(followUpsResult.value, 'followUpId'));
      if (activitiesResult.status === 'fulfilled') setActivities(dedupeEntities(activitiesResult.value));
      if (paymentsResult.status === 'fulfilled') setPayments(dedupeEntities(paymentsResult.value, 'paymentRef'));
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
      // Refetch customer balances and stats
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

    socket.on('customer:created', handleCustomerCreated);
    socket.on('customer:updated', handleCustomerUpdated);
    socket.on('customer:assigned', handleCustomerAssigned);
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

    return () => {
      socket.off('customer:created', handleCustomerCreated);
      socket.off('customer:updated', handleCustomerUpdated);
      socket.off('customer:assigned', handleCustomerAssigned);
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
    } else {
      setActiveSalesTab('dashboard');
    }

    connectSocket();
    await refreshData();
    showToast(`Signed in as ${session.user.name} (${session.role === 'admin' ? 'Admin' : 'Sales Member'})`, 'success');
  };

  const logout = async () => {
    await authService.logout();
    disconnectSocket();
    setRole(null);
    setUserProfile(DEFAULT_USER_PROFILE);
    setDetailedCustomerView(null);
    setSalesMembers([]);
    setCustomers([]);
    setLeads([]);
    setFollowUps([]);
    setActivities([]);
    setPayments([]);
    setNotifications([]);
    setStats(null);
    setActiveAdminTab('dashboard');
    setActiveSalesTab('dashboard');
    showToast('Signed out successfully', 'info');
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
  const activeCustomers = stats?.activeCustomers ?? customers.filter((c) => c.status === 'Active' || c.status === 'Onboarding').length;
  const totalSalesMembers = stats?.totalSalesMembers ?? salesMembers.length;
  const openLeadsCount = (role === 'sales' ? stats?.myOpenLeads : stats?.openLeads) ?? leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const pendingFollowUpsCount = (role === 'sales' ? stats?.pendingFollowUps : stats?.pendingFollowUps) ?? followUps.filter((f) => f.status !== 'Completed' && f.status !== 'Cancelled').length;

  return (
    <DashboardContext.Provider
      value={{
        role,
        userProfile,
        login,
        logout,
        updateUserProfile,
        activeAdminTab,
        setActiveAdminTab,
        activeSalesTab,
        setActiveSalesTab,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileNavOpen,
        setIsMobileNavOpen,
        salesMembers,
        customers,
        leads,
        followUps,
        activities,
        payments,
        notifications,
        unreadNotificationCount,
        stats,
        refreshStats,
        myCustomers,
        myLeads,
        myFollowUps,
        myActivities,
        todayFollowUps,
        overdueFollowUps,
        upcomingFollowUps,
        totalCustomers,
        activeCustomers,
        totalSalesMembers,
        openLeadsCount,
        pendingFollowUpsCount,
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
