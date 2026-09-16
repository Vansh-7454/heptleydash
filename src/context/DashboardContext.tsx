'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserRole,
  SalesMember,
  Customer,
  AdminTab,
  SalesTab,
  ToastMessage,
  UserProfile,
  ClientProject,
  ProjectStage,
  CRMTask,
} from '@/types';
import { INITIAL_SALES_MEMBERS, INITIAL_CUSTOMERS, INITIAL_PROJECTS, INITIAL_TASKS } from '@/data/mockData';

interface DashboardContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeSalesTab: SalesTab;
  setActiveSalesTab: (tab: SalesTab) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  salesMembers: SalesMember[];
  customers: Customer[];
  currentSalesMember: SalesMember;
  setCurrentSalesMember: (member: SalesMember) => void;

  // Detailed Customer View (page-level navigation)
  detailedCustomerView: Customer | null;
  setDetailedCustomerView: (customer: Customer | null) => void;

  // Sales Member Actions
  addSalesMember: (data: { name: string; email: string; phone: string; status: 'Active' | 'Inactive' }) => SalesMember;
  editSalesMember: (memberId: string, data: { name: string; email: string; phone: string; status: 'Active' | 'Inactive' }) => void;
  deleteSalesMember: (memberId: string) => void;
  toggleSalesMemberStatus: (memberId: string) => void;
  getNextMemberId: () => string;
  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
  viewingSalesMember: SalesMember | null;
  setViewingSalesMember: (member: SalesMember | null) => void;
  editingSalesMember: SalesMember | null;
  setEditingSalesMember: (member: SalesMember | null) => void;

  // Customer Actions
  addCustomer: (data: Omit<Customer, 'id' | 'customerId' | 'salesMemberName' | 'createdAt'>) => Customer;
  editCustomer: (customerId: string, data: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  getNextCustomerId: () => string;
  isAddCustomerModalOpen: boolean;
  setIsAddCustomerModalOpen: (open: boolean) => void;
  selectedCustomer: Customer | null;
  openCustomerDetails: (customer: Customer) => void;
  closeCustomerDetails: () => void;
  editingCustomer: Customer | null;
  setEditingCustomer: (customer: Customer | null) => void;

  // Client Projects & Deliverables
  projects: ClientProject[];
  addProject: (data: Omit<ClientProject, 'id' | 'projectId' | 'createdAt'>) => ClientProject;
  updateProjectStage: (projectId: string, newStage: ProjectStage) => void;
  deleteProject: (projectId: string) => void;
  isAddProjectModalOpen: boolean;
  setIsAddProjectModalOpen: (open: boolean) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // CRM Tasks & Follow-ups
  tasks: CRMTask[];
  addTask: (data: Omit<CRMTask, 'id' | 'taskId' | 'createdAt' | 'completed'>) => CRMTask;
  toggleTaskComplete: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;

  // Profile & User
  userProfile: UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  // Toast System
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Utility Actions
  resetDemoData: () => void;

  // Computed Metrics
  totalCustomers: number;
  activeCustomers: number;
  totalSalesMembers: number;
  myCustomers: Customer[];
  myActiveCustomers: number;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const LS_MEMBERS_KEY = 'heptley_v2_sales_members';
const LS_CUSTOMERS_KEY = 'heptley_v2_customers';
const LS_PROFILE_KEY = 'heptley_v2_profile';
const LS_PROJECTS_KEY = 'heptley_v2_projects';
const LS_TASKS_KEY = 'heptley_v2_tasks';

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [activeSalesTab, setActiveSalesTab] = useState<SalesTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Detailed Customer View state
  const [detailedCustomerView, setDetailedCustomerView] = useState<Customer | null>(null);

  // State initialized with mockData, then updated from localStorage
  const [salesMembers, setSalesMembers] = useState<SalesMember[]>(INITIAL_SALES_MEMBERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [currentSalesMember, setCurrentSalesMember] = useState<SalesMember>(INITIAL_SALES_MEMBERS[0]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin Executive',
    email: 'admin@heptley.in',
    phone: '+91 9876543200',
    role: 'admin',
    title: 'Operations & Business Oversight',
  });

  // Modals state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [viewingSalesMember, setViewingSalesMember] = useState<SalesMember | null>(null);
  const [editingSalesMember, setEditingSalesMember] = useState<SalesMember | null>(null);

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // CRM State
  const [projects, setProjects] = useState<ClientProject[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<CRMTask[]>(INITIAL_TASKS);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Load from localStorage once mounted
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem(LS_MEMBERS_KEY);
      const savedCustomers = localStorage.getItem(LS_CUSTOMERS_KEY);
      const savedProfile = localStorage.getItem(LS_PROFILE_KEY);
      const savedProjects = localStorage.getItem(LS_PROJECTS_KEY);
      const savedTasks = localStorage.getItem(LS_TASKS_KEY);

      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSalesMembers(parsed);
          setCurrentSalesMember(parsed[0]);
        }
      }

      if (savedCustomers) {
        const parsed = JSON.parse(savedCustomers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomers(parsed);
        }
      }

      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      }

      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch {
      // fallback
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Persist to localStorage whenever data changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(salesMembers));
    } catch {}
  }, [salesMembers, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LS_CUSTOMERS_KEY, JSON.stringify(customers));
    } catch {}
  }, [customers, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(userProfile));
    } catch {}
  }, [userProfile, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks, isHydrated]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
    showToast('Profile updated successfully!', 'success');
  };

  // Reset Demo Data
  const resetDemoData = () => {
    try {
      localStorage.removeItem(LS_MEMBERS_KEY);
      localStorage.removeItem(LS_CUSTOMERS_KEY);
      localStorage.removeItem(LS_PROFILE_KEY);
      localStorage.removeItem(LS_PROJECTS_KEY);
      localStorage.removeItem(LS_TASKS_KEY);
    } catch {}
    setSalesMembers(INITIAL_SALES_MEMBERS);
    setCustomers(INITIAL_CUSTOMERS);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setCurrentSalesMember(INITIAL_SALES_MEMBERS[0]);
    setUserProfile({
      name: 'Admin Executive',
      email: 'admin@heptley.in',
      phone: '+91 9876543200',
      role: 'admin',
      title: 'Operations & Business Oversight',
    });
    showToast('Demo data restored to defaults', 'info');
  };

  // Next Sales Member ID
  const getNextMemberId = (): string => {
    const maxNum = salesMembers.reduce((max, sm) => {
      const num = parseInt(sm.memberId.replace('SM-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const nextNum = maxNum + 1;
    return `SM-${nextNum.toString().padStart(3, '0')}`;
  };

  // Next Customer ID
  const getNextCustomerId = (): string => {
    const maxNum = customers.reduce((max, c) => {
      const num = parseInt(c.customerId.replace('CUS-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const nextNum = maxNum + 1;
    return `CUS-${nextNum.toString().padStart(4, '0')}`;
  };

  // Add Sales Member
  const addSalesMember = (data: {
    name: string;
    email: string;
    phone: string;
    status: 'Active' | 'Inactive';
  }): SalesMember => {
    const nextId = getNextMemberId();
    const today = new Date().toISOString().split('T')[0];
    const newMember: SalesMember = {
      id: `sm_${Date.now()}`,
      memberId: nextId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      customerCount: 0,
      joiningDate: today,
      createdAt: today,
    };

    setSalesMembers((prev) => [newMember, ...prev]);
    showToast(`Sales member ${newMember.name} (${newMember.memberId}) created!`, 'success');
    return newMember;
  };

  // Edit Sales Member
  const editSalesMember = (
    memberId: string,
    data: { name: string; email: string; phone: string; status: 'Active' | 'Inactive' }
  ) => {
    setSalesMembers((prev) =>
      prev.map((sm) => (sm.memberId === memberId ? { ...sm, ...data } : sm))
    );
    if (currentSalesMember.memberId === memberId) {
      setCurrentSalesMember((prev) => ({ ...prev, ...data }));
    }
    showToast(`Sales member ${memberId} updated`, 'success');
  };

  // Toggle Sales Member status
  const toggleSalesMemberStatus = (memberId: string) => {
    setSalesMembers((prev) =>
      prev.map((sm) => {
        if (sm.memberId === memberId) {
          const newStatus = sm.status === 'Active' ? 'Inactive' : 'Active';
          showToast(`Member ${sm.name} is now ${newStatus}`, 'info');
          return { ...sm, status: newStatus };
        }
        return sm;
      })
    );
    if (currentSalesMember.memberId === memberId) {
      setCurrentSalesMember((prev) => ({
        ...prev,
        status: prev.status === 'Active' ? 'Inactive' : 'Active',
      }));
    }
  };

  // Delete / Remove Sales Member
  const deleteSalesMember = (memberId: string) => {
    const memberToDelete = salesMembers.find((sm) => sm.memberId === memberId);
    setSalesMembers((prev) => prev.filter((sm) => sm.memberId !== memberId));
    // Safely reassign any customer assigned to this sales member
    setCustomers((prev) =>
      prev.map((c) =>
        c.salesMemberId === memberId
          ? { ...c, salesMemberName: 'Unassigned', salesMemberId: 'UNASSIGNED' }
          : c
      )
    );
    showToast(
      memberToDelete
        ? `Sales member ${memberToDelete.name} (${memberId}) removed`
        : `Sales member ${memberId} removed`,
      'info'
    );
  };

  // Add Customer
  const addCustomer = (
    data: Omit<Customer, 'id' | 'customerId' | 'salesMemberName' | 'createdAt'>
  ): Customer => {
    const nextId = getNextCustomerId();
    const assignedMember = salesMembers.find((sm) => sm.memberId === data.salesMemberId);
    const salesMemberName = assignedMember ? assignedMember.name : data.salesMemberId;
    const today = new Date().toISOString().split('T')[0];

    const newCustomer: Customer = {
      ...data,
      id: `cus_${Date.now()}`,
      customerId: nextId,
      salesMemberName,
      createdAt: today,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Customer ${newCustomer.name} (${newCustomer.customerId}) added!`, 'success');
    return newCustomer;
  };

  // Edit Customer
  const editCustomer = (customerId: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.customerId === customerId) {
          const updated = { ...c, ...data };
          if (data.salesMemberId && data.salesMemberId !== c.salesMemberId) {
            const member = salesMembers.find((sm) => sm.memberId === data.salesMemberId);
            if (member) updated.salesMemberName = member.name;
          }
          return updated;
        }
        return c;
      })
    );

    if (selectedCustomer && selectedCustomer.customerId === customerId) {
      setSelectedCustomer((prev) => (prev ? { ...prev, ...data } : null));
    }
    if (detailedCustomerView && detailedCustomerView.customerId === customerId) {
      setDetailedCustomerView((prev) => (prev ? { ...prev, ...data } : null));
    }
    showToast(`Customer ${customerId} updated successfully`, 'success');
  };

  // Delete Customer
  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.customerId !== customerId));
    if (detailedCustomerView?.customerId === customerId) {
      setDetailedCustomerView(null);
    }
    showToast(`Customer ${customerId} removed`, 'info');
  };

  // Client Project Actions
  const addProject = (data: Omit<ClientProject, 'id' | 'projectId' | 'createdAt'>): ClientProject => {
    const nextNum = projects.length + 101;
    const newProject: ClientProject = {
      ...data,
      id: `proj_${Date.now()}`,
      projectId: `PRJ-${nextNum}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects((prev) => [newProject, ...prev]);
    showToast(`Project "${newProject.title}" added to deliverables!`, 'success');
    return newProject;
  };

  const updateProjectStage = (projectId: string, newStage: ProjectStage) => {
    setProjects((prev) =>
      prev.map((p) => (p.projectId === projectId ? { ...p, stage: newStage } : p))
    );
    showToast(`Project moved to ${newStage.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.projectId !== projectId));
    showToast(`Project ${projectId} removed`, 'info');
  };

  // CRM Task Actions
  const addTask = (data: Omit<CRMTask, 'id' | 'taskId' | 'createdAt' | 'completed'>): CRMTask => {
    const nextNum = tasks.length + 1;
    const newTask: CRMTask = {
      ...data,
      id: `task_${Date.now()}`,
      taskId: `TSK-${nextNum.toString().padStart(3, '0')}`,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" scheduled!`, 'success');
    return newTask;
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.taskId === taskId) {
          const updated = !t.completed;
          showToast(updated ? 'Task marked complete!' : 'Task reopened', 'info');
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
    showToast(`Task ${taskId} removed`, 'info');
  };

  const openCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  // Global Metrics
  const totalCustomers = customers.length;
  const activeCustomers = useMemo(
    () => customers.filter((c) => c.status === 'Active' || c.status === 'Onboarding').length,
    [customers]
  );
  const totalSalesMembers = salesMembers.length;

  // Customers portfolio for Sales role
  const myCustomers = useMemo(
    () => customers,
    [customers]
  );

  const myActiveCustomers = useMemo(
    () =>
      myCustomers.filter((c) => c.status === 'Active' || c.status === 'Onboarding').length,
    [myCustomers]
  );

  return (
    <DashboardContext.Provider
      value={{
        role,
        setRole,
        activeAdminTab,
        setActiveAdminTab,
        activeSalesTab,
        setActiveSalesTab,
        isMobileNavOpen,
        setIsMobileNavOpen,
        isSidebarCollapsed,
        toggleSidebar,
        salesMembers,
        customers,
        currentSalesMember,
        setCurrentSalesMember,
        detailedCustomerView,
        setDetailedCustomerView,
        addSalesMember,
        editSalesMember,
        deleteSalesMember,
        toggleSalesMemberStatus,
        getNextMemberId,
        isAddMemberModalOpen,
        setIsAddMemberModalOpen,
        viewingSalesMember,
        setViewingSalesMember,
        editingSalesMember,
        setEditingSalesMember,
        addCustomer,
        editCustomer,
        deleteCustomer,
        getNextCustomerId,
        isAddCustomerModalOpen,
        setIsAddCustomerModalOpen,
        selectedCustomer,
        openCustomerDetails,
        closeCustomerDetails,
        editingCustomer,
        setEditingCustomer,
        userProfile,
        updateUserProfile,
        toasts,
        showToast,
        removeToast,
        resetDemoData,
        totalCustomers,
        activeCustomers,
        totalSalesMembers,
        myCustomers,
        myActiveCustomers,
        // Client Projects
        projects,
        addProject,
        updateProjectStage,
        deleteProject,
        isAddProjectModalOpen,
        setIsAddProjectModalOpen,
        // CRM Tasks
        tasks,
        addTask,
        toggleTaskComplete,
        deleteTask,
        isAddTaskModalOpen,
        setIsAddTaskModalOpen,
        // Command Palette
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
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
