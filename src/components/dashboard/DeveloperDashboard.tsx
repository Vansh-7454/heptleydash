'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Badge, Button, Modal } from '@/components/ui';
import {
  Code,
  Globe,
  Server,
  HelpCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  FileText,
  Bell,
  ArrowRight,
  Send,
  CheckCircle2,
  Calendar,
  Layers,
  Plus,
  Building2,
  Eye,
  Edit2,
  UploadCloud,
  Download,
  Trash2,
  Paperclip,
  Briefcase,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Website, WebsiteStatus, Customer, ProjectStatus } from '@/types';
import { parseClientDisplay, formatDateDisplay } from '@/utils/formatters';

const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; bg: string; color: string; border: string; dot: string; description: string }
> = {
  Planning: {
    label: 'Planning',
    bg: '#f5f3ff',
    color: '#6d28d9',
    border: '#ddd6fe',
    dot: '#8b5cf6',
    description: 'System architecture, DB schema & technical design in progress',
  },
  'In Progress': {
    label: 'In Progress',
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
    dot: '#3b82f6',
    description: 'Active coding, UI development & feature implementation',
  },
  Review: {
    label: 'Review',
    bg: '#fffbeb',
    color: '#b45309',
    border: '#fde68a',
    dot: '#f59e0b',
    description: 'Internal QA testing, client staging walkthrough & review',
  },
  Completed: {
    label: 'Completed',
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0',
    dot: '#10b981',
    description: 'Successfully deployed to production, live and verified',
  },
  'On Hold': {
    label: 'On Hold',
    bg: '#fff1f2',
    color: '#be123c',
    border: '#fecdd3',
    dot: '#f43f5e',
    description: 'Blocked waiting for client assets, credentials, or sign-off',
  },
};

const PROJECT_STATUS_LIST: ProjectStatus[] = [
  'Planning',
  'In Progress',
  'Review',
  'Completed',
  'On Hold',
];

export default function DeveloperDashboard() {
  const {
    websites,
    customers,
    salesQuestions,
    notifications,
    answerSalesQuestion,
    createWebsite,
    updateWebsite,
    editCustomer,
    setActiveDeveloperTab,
  } = useDashboard();

  // Quick answering state for Sales Questions
  const [answeringQId, setAnsweringQId] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client Projects & Technical Delivery State
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [selectedCustomerForSpecs, setSelectedCustomerForSpecs] = useState<Customer | null>(null);
  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);

  const handleUpdateProjectStatus = async (customer: Customer, newStatus: ProjectStatus) => {
    const custId = customer.id || customer.customerId;
    setIsUpdatingStatusId(custId);
    try {
      await editCustomer(custId, { projectStatus: newStatus });
      if (
        selectedCustomerForSpecs &&
        (selectedCustomerForSpecs.id === custId || selectedCustomerForSpecs.customerId === custId)
      ) {
        setSelectedCustomerForSpecs((prev) => (prev ? { ...prev, projectStatus: newStatus } : null));
      }
    } catch (err: any) {
      console.error('Failed to update project status:', err);
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  // Unified Website & Domain Form Modal state on Developer Dashboard
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [viewingWebsite, setViewingWebsite] = useState<Website | null>(null);

  // Form Fields
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formWebsiteName, setFormWebsiteName] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formProjectType, setFormProjectType] = useState('Full-Stack Web Application');
  const [formStatus, setFormStatus] = useState<WebsiteStatus>('LIVE');
  const [formStartDate, setFormStartDate] = useState('');
  const [formTechStack, setFormTechStack] = useState('');
  const [formRepoUrl, setFormRepoUrl] = useState('');
  const [formDeploymentUrl, setFormDeploymentUrl] = useState('');
  const [formHostingProvider, setFormHostingProvider] = useState('Vercel');
  const [formHostingNotes, setFormHostingNotes] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInternalNotes, setFormInternalNotes] = useState('');

  // Domain Fields (Part of the same form)
  const [formDomainName, setFormDomainName] = useState('');
  const [formDomainStartDate, setFormDomainStartDate] = useState('');
  const [formDomainExpiryDate, setFormDomainExpiryDate] = useState('');
  const [formDomainRegistrar, setFormDomainRegistrar] = useState('GoDaddy');
  const [formDomainAutoRenew, setFormDomainAutoRenew] = useState(true);
  const [formDomainNotes, setFormDomainNotes] = useState('');

  // Client & Domain PDF Document (Small size in KB, max 500 KB)
  const [formDomainPdf, setFormDomainPdf] = useState('');
  const [formDomainPdfName, setFormDomainPdfName] = useState('');
  const [formDomainPdfSizeKb, setFormDomainPdfSizeKb] = useState(0);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PDF type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFormError('Only PDF documents (.pdf) are allowed.');
      return;
    }

    // Size limit: 500 KB (small size in KB as requested)
    const sizeInKb = Math.round(file.size / 1024);
    const MAX_KB = 500;
    if (sizeInKb > MAX_KB) {
      setFormError(`PDF file size is too large (${sizeInKb} KB). Please upload a file smaller than ${MAX_KB} KB.`);
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormDomainPdf(reader.result);
        setFormDomainPdfName(file.name);
        setFormDomainPdfSizeKb(sizeInKb);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setFormDomainPdf('');
    setFormDomainPdfName('');
    setFormDomainPdfSizeKb(0);
  };

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Open New Website Form Modal (supports prefilled customer ID from project table)
  const handleOpenNewWebsite = (prefilledCustomerId?: string) => {
    setEditingWebsite(null);
    const targetCustId = prefilledCustomerId || customers[0]?.customerId || '';
    setFormCustomerId(targetCustId);
    const targetCustomer = customers.find((c) => c.customerId === targetCustId);

    setFormWebsiteName(
      targetCustomer ? `${targetCustomer.company || targetCustomer.name} Official Website` : ''
    );
    setFormWebsiteUrl(
      targetCustomer?.website && targetCustomer.website.startsWith('http')
        ? targetCustomer.website
        : targetCustomer?.website
        ? `https://${targetCustomer.website}`
        : 'https://'
    );
    setFormProjectType(
      targetCustomer?.service ? `${targetCustomer.service} Delivery` : 'Full-Stack Web Application'
    );
    setFormStatus('LIVE');
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormStartDate(today);
    setFormTechStack('Next.js, TypeScript, Tailwind, MongoDB');
    setFormRepoUrl('');
    setFormDeploymentUrl('');
    setFormHostingProvider('Vercel');
    setFormHostingNotes('');
    setFormDescription(targetCustomer?.notes ? `Client Brief: ${targetCustomer.notes}` : '');
    setFormInternalNotes(
      targetCustomer?.internalRemarks
        ? `Technical Directives: ${targetCustomer.internalRemarks}`
        : ''
    );

    setFormDomainName(
      targetCustomer?.website
        ? targetCustomer.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()
        : ''
    );
    setFormDomainStartDate(today);
    setFormDomainExpiryDate(nextYear.toISOString().split('T')[0]);
    setFormDomainRegistrar('GoDaddy');
    setFormDomainAutoRenew(true);
    setFormDomainNotes('');

    setFormDomainPdf('');
    setFormDomainPdfName('');
    setFormDomainPdfSizeKb(0);

    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Website Form Modal
  const handleOpenEditWebsite = (w: Website) => {
    setEditingWebsite(w);
    setFormCustomerId(w.customerId || customers[0]?.customerId || '');
    setFormWebsiteName(w.websiteName || w.name || '');
    setFormWebsiteUrl(w.websiteUrl || w.url || '');
    setFormProjectType(w.projectType || 'Full-Stack Web Application');
    setFormStatus(w.status || 'DEVELOPMENT');
    setFormStartDate(w.startDate || '');
    setFormTechStack(w.technologyStack || '');
    setFormRepoUrl(w.repositoryUrl || '');
    setFormDeploymentUrl(w.deploymentUrl || '');
    setFormHostingProvider(w.hostingProvider || '');
    setFormHostingNotes(w.hostingNotes || '');
    setFormDescription(w.description || '');
    setFormInternalNotes(w.internalNotes || '');

    setFormDomainName(w.domainName || '');
    setFormDomainStartDate(w.domainStartDate ? w.domainStartDate.split('T')[0] : '');
    setFormDomainExpiryDate(w.domainExpiryDate ? w.domainExpiryDate.split('T')[0] : '');
    setFormDomainRegistrar(w.domainRegistrar || 'GoDaddy');
    setFormDomainAutoRenew(w.domainAutoRenew ?? true);
    setFormDomainNotes(w.domainNotes || '');

    setFormDomainPdf(w.domainDocumentPdf || '');
    setFormDomainPdfName(w.domainDocumentName || '');
    setFormDomainPdfSizeKb(w.domainDocumentSizeKb || 0);

    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Submit Website Form
  const handleSubmitWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formWebsiteName.trim()) {
      setFormError('Website name is required.');
      return;
    }
    if (!formWebsiteUrl.trim() || !formWebsiteUrl.startsWith('http')) {
      setFormError('Valid website URL is required (e.g. https://...).');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        websiteName: formWebsiteName.trim(),
        websiteUrl: formWebsiteUrl.trim(),
        name: formWebsiteName.trim(),
        url: formWebsiteUrl.trim(),
        customerId: formCustomerId || undefined,
        projectType: formProjectType.trim(),
        status: formStatus,
        startDate: formStartDate || new Date().toISOString().split('T')[0],
        technologyStack: formTechStack.trim(),
        repositoryUrl: formRepoUrl.trim(),
        deploymentUrl: formDeploymentUrl.trim(),
        hostingProvider: formHostingProvider.trim(),
        hostingNotes: formHostingNotes.trim(),
        description: formDescription.trim(),
        internalNotes: formInternalNotes.trim(),

        // Domain Info (Part of same form)
        domainName: formDomainName.trim().toLowerCase(),
        domainStartDate: formDomainStartDate || undefined,
        domainExpiryDate: formDomainExpiryDate || undefined,
        domainRegistrar: formDomainRegistrar.trim() || 'Custom Registrar',
        domainAutoRenew: formDomainAutoRenew,
        domainNotes: formDomainNotes.trim(),

        // Client & Domain Document (PDF)
        domainDocumentPdf: formDomainPdf,
        domainDocumentName: formDomainPdfName,
        domainDocumentSizeKb: formDomainPdfSizeKb,
      };

      if (editingWebsite) {
        await updateWebsite(editingWebsite.id || editingWebsite.websiteId, payload);
      } else {
        await createWebsite(payload);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit website record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAnswer = async (questionId: string) => {
    if (!answerContent.trim()) return;
    setIsSubmitting(true);
    try {
      await answerSalesQuestion(questionId, answerContent.trim());
      setAnsweringQId(null);
      setAnswerContent('');
    } catch (err) {
      console.error('Failed to answer question:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for dynamic countdown
  const getDaysRemaining = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Metric counts
  const totalProjects = customers.length;
  const inProgressProjects = customers.filter((c) => c.projectStatus === 'In Progress').length;
  const reviewProjects = customers.filter((c) => c.projectStatus === 'Review').length;
  const planningProjects = customers.filter((c) => c.projectStatus === 'Planning').length;
  const completedProjects = customers.filter((c) => c.projectStatus === 'Completed').length;
  const onHoldProjects = customers.filter((c) => c.projectStatus === 'On Hold').length;

  const totalWebsites = websites.length;
  const liveWebsites = websites.filter((w) => w.status === 'LIVE' || w.status === 'ACTIVE').length;

  const domainsCount = websites.filter((w) => w.domainName).length;
  const expiringDomainsCount = websites.filter((w) => {
    const days = w.daysRemaining ?? getDaysRemaining(w.domainExpiryDate);
    return days !== null && days <= 30;
  }).length;

  const openSalesQuestions = salesQuestions.filter((q) => q.status === 'OPEN').length;
  const highPriorityQuestions = salesQuestions.filter(
    (q) => q.status === 'OPEN' && q.priority === 'HIGH'
  ).length;

  // Filtered Client Projects for Section A
  const filteredProjects = customers.filter((c) => {
    const q = projectSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      (c.service && c.service.toLowerCase().includes(q)) ||
      (c.salesMemberName && c.salesMemberName.toLowerCase().includes(q));

    const matchesStatus =
      projectStatusFilter === 'all' || c.projectStatus === projectStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2.5rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--brand-accent-text)',
              marginBottom: '0.35rem',
            }}
          >
            <Code size={15} />
            <span>Developer Command Center</span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Developer Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            Unified engineering workspace: track client project delivery status, record completed websites with integrated domain details, and answer sales technical inquiries.
          </p>
        </div>

        {/* Developer Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="primary"
            size="sm"
            className="btn-pill"
            leftIcon={<Plus size={14} />}
            onClick={() => handleOpenNewWebsite()}
          >
            Record Completed Website
          </Button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.15rem',
              borderRadius: '9999px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#15803d',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(34, 197, 94, 0.1)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
              }}
            />
            <span>DEVELOPER</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: Active Client Projects */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-default)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Client Projects
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0369a1', lineHeight: 1.15, marginTop: '0.25rem' }}>
              {totalProjects}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.35rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#1d4ed8' }}>{inProgressProjects} In Progress</span>
              <span>·</span>
              <span style={{ color: '#b45309' }}>{reviewProjects} Review</span>
              <span>·</span>
              <span style={{ color: '#047857' }}>{completedProjects} Done</span>
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Briefcase size={22} />
          </div>
        </div>

        {/* Card 2: Websites Managed */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-default)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Websites Managed
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', lineHeight: 1.15, marginTop: '0.25rem' }}>
              {totalWebsites}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
              {liveWebsites} Production Sites Live
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Globe size={22} />
          </div>
        </div>

        {/* Card 3: Connected Domains */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-default)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Connected Domains
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1.15, marginTop: '0.25rem' }}>
              {domainsCount}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '0.35rem', color: expiringDomainsCount > 0 ? '#b91c1c' : '#7c3aed' }}>
              {expiringDomainsCount > 0 ? `${expiringDomainsCount} Expiring Soon (<30d)` : 'All Domains Monitored'}
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Server size={22} />
          </div>
        </div>

        {/* Card 4: Sales Tech Inquiries */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-default)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Sales Questions
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', lineHeight: 1.15, marginTop: '0.25rem' }}>
              {openSalesQuestions}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '0.35rem', color: highPriorityQuestions > 0 ? '#dc2626' : '#64748b' }}>
              {highPriorityQuestions > 0 ? `${highPriorityQuestions} High Priority Pending` : 'Technical Inquiries Answered'}
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={22} />
          </div>
        </div>
      </div>

      {/* 3. Section A: Client Projects & Technical Delivery */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Section Header with Search & Filter Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
              }}
            >
              <Briefcase size={19} color="#0284c7" />
              <span>Section A: Client Projects & Technical Delivery</span>
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
              Active client accounts, requested engineering services, technical specifications, and real-time project delivery status.
            </span>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search clients, services, IDs..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.1rem',
                  fontSize: '0.82rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-default)',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            flexWrap: 'wrap',
            marginBottom: '1.15rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={() => setProjectStatusFilter('all')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: projectStatusFilter === 'all' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: projectStatusFilter === 'all' ? '#0284c7' : '#ffffff',
              color: projectStatusFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            All Projects ({totalProjects})
          </button>

          {PROJECT_STATUS_LIST.map((status) => {
            const count = customers.filter((c) => c.projectStatus === status).length;
            const isSelected = projectStatusFilter === status;
            const cfg = PROJECT_STATUS_CONFIG[status];
            return (
              <button
                key={status}
                onClick={() => setProjectStatusFilter(status)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: isSelected ? `1.5px solid ${cfg.color}` : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? cfg.bg : '#ffffff',
                  color: isSelected ? cfg.color : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: cfg.dot,
                  }}
                />
                <span>{status}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.05rem 0.4rem',
                    borderRadius: '9999px',
                    backgroundColor: isSelected ? '#ffffff' : '#f1f5f9',
                    color: isSelected ? cfg.color : '#64748b',
                    fontWeight: 800,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Client Projects Data Table */}
        {filteredProjects.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No client projects found matching the filter criteria.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px', whiteSpace: 'nowrap' }}>Client ID</th>
                  <th style={{ minWidth: '200px' }}>Client & Company</th>
                  <th style={{ minWidth: '180px' }}>Service Requested</th>
                  <th style={{ minWidth: '150px' }}>Delivery Timeline</th>
                  <th style={{ width: '120px' }}>Specifications</th>
                  <th style={{ minWidth: '180px' }}>Linked Production Site</th>
                  <th style={{ minWidth: '190px' }}>Project Status (Developer Control)</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((c) => {
                  const linkedWebsite = websites.find(
                    (w) =>
                      w.customerId === c.customerId ||
                      (c.website && (w.websiteUrl === c.website || w.url === c.website))
                  );
                  const currentStatus = c.projectStatus || 'In Progress';
                  const cfg = PROJECT_STATUS_CONFIG[currentStatus] || PROJECT_STATUS_CONFIG['In Progress'];
                  const isUpdating = isUpdatingStatusId === (c.id || c.customerId);

                  return (
                    <tr key={c.id || c.customerId}>
                      {/* 1. Client ID */}
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span className="table-id-tag">{c.customerId}</span>
                      </td>

                      {/* 2. Client & Company */}
                      <td style={{ verticalAlign: 'middle' }}>
                        <div className="table-cell-title">
                          {c.company || c.name}
                        </div>
                        {c.company && c.name && (
                          <div className="table-cell-subtitle">
                            POC: {c.name}
                          </div>
                        )}
                        <div style={{ marginTop: '0.3rem' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.12rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: '#f0f9fd',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              display: 'inline-block',
                            }}
                          >
                            Sales: {c.salesMemberName || 'General Sales'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Service Requested & Package */}
                      <td style={{ verticalAlign: 'middle' }}>
                        <div className="table-cell-title">
                          {c.service || 'Web Application'}
                        </div>
                        <div style={{ marginTop: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.12rem 0.5rem',
                              borderRadius: '6px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              display: 'inline-block',
                            }}
                          >
                            {c.package || 'Standard Delivery'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Delivery Timeline */}
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                          {formatDateDisplay(c.startDate)}
                          <span style={{ color: 'var(--text-muted)', margin: '0 0.25rem' }}>→</span>
                          {c.endDate ? formatDateDisplay(c.endDate) : 'Ongoing'}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.15rem', display: 'block' }}>
                          Target Delivery
                        </span>
                      </td>

                      {/* 5. Specifications & Notes */}
                      <td style={{ verticalAlign: 'middle' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-pill"
                          leftIcon={<FileText size={12} />}
                          onClick={() => setSelectedCustomerForSpecs(c)}
                        >
                          View Specs
                        </Button>
                      </td>

                      {/* 6. Linked Production Site */}
                      <td style={{ verticalAlign: 'middle' }}>
                        {linkedWebsite ? (
                          <div>
                            <div className="table-cell-title" style={{ fontSize: '0.82rem' }}>
                              {linkedWebsite.websiteName || linkedWebsite.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <a
                                href={linkedWebsite.websiteUrl || linkedWebsite.url}
                                target="_blank"
                                rel="noreferrer"
                                className="table-url-link"
                                style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={linkedWebsite.websiteUrl || linkedWebsite.url}
                              >
                                <span>Visit Site</span>
                                <ExternalLink size={10} style={{ flexShrink: 0 }} />
                              </a>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <button
                                onClick={() => setViewingWebsite(linkedWebsite)}
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#64748b',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  textDecoration: 'underline',
                                }}
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="table-null-state" style={{ marginBottom: '0.35rem', display: 'flex' }}>
                              Not deployed yet
                            </span>
                            <button
                              onClick={() => handleOpenNewWebsite(c.customerId)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                backgroundColor: '#f0f9fd',
                                color: '#0284c7',
                                border: '1px dashed var(--border-default)',
                                cursor: 'pointer',
                              }}
                              title="Record production website for this client"
                            >
                              <Plus size={11} />
                              <span>Deploy Site</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 7. Interactive Project Status Dropdown */}
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <select
                            value={currentStatus}
                            disabled={isUpdating}
                            onChange={(e) => handleUpdateProjectStatus(c, e.target.value as ProjectStatus)}
                            style={{
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                              border: `1.5px solid ${cfg.border}`,
                              borderRadius: '9999px',
                              padding: '0.35rem 1.8rem 0.35rem 0.85rem',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                              outline: 'none',
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.6rem center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                              transition: 'all 0.15s ease',
                              opacity: isUpdating ? 0.65 : 1,
                            }}
                            title="Update Project Status (Syncs to Admin & Sales in real-time)"
                          >
                            {PROJECT_STATUS_LIST.map((status) => (
                              <option key={status} value={status} style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {isUpdating && <Loader2 size={13} className="spin" color="#0284c7" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Section B: Client Websites & Integrated Domain Deployments */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} color="#0284c7" />
              <span>Section B: Client Websites & Integrated Domain Deployments</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Live production sites with integrated domain registration status and expiration countdowns
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              className="btn-pill"
              leftIcon={<Plus size={14} />}
              onClick={() => handleOpenNewWebsite()}
            >
              Add Website
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="btn-pill"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => setActiveDeveloperTab('websites-domains')}
            >
              All Websites ({websites.length})
            </Button>
          </div>
        </div>

        {websites.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No websites currently recorded. Click "+ Record Completed Website" above to add your first deployment.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '105px', whiteSpace: 'nowrap' }}>Website ID</th>
                  <th style={{ minWidth: '170px' }}>Client & Account</th>
                  <th style={{ minWidth: '170px' }}>Site Name & URL</th>
                  <th style={{ minWidth: '160px' }}>Domain & Registrar</th>
                  <th style={{ minWidth: '145px' }}>Domain Expiry Countdown</th>
                  <th style={{ width: '100px', minWidth: '100px' }}>Status</th>
                  <th style={{ width: '110px', minWidth: '110px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((w) => {
                  const days = w.daysRemaining ?? getDaysRemaining(w.domainExpiryDate);
                  const clientInfo = parseClientDisplay(w.customerName);

                  return (
                    <tr
                      key={w.id || w.websiteId}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          const selection = window.getSelection();
                          if (selection && selection.toString().trim().length > 0) return;
                        }
                        setViewingWebsite(w);
                      }}
                    >
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span className="table-id-tag">{w.websiteId}</span>
                      </td>

                      <td style={{ verticalAlign: 'middle' }}>
                        <div className="table-cell-title">
                          {clientInfo.primary}
                        </div>
                        {clientInfo.secondary && (
                          <div className="table-cell-subtitle">
                            POC: {clientInfo.secondary}
                          </div>
                        )}
                        {w.customerId && (
                          <div style={{ marginTop: '0.3rem' }}>
                            <span
                              style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: '#475569',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '0.12rem 0.45rem',
                                borderRadius: '4px',
                                display: 'inline-block',
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {w.customerId}
                            </span>
                          </div>
                        )}
                      </td>

                      <td style={{ verticalAlign: 'middle' }}>
                        <div className="table-cell-title">{w.websiteName || w.name}</div>
                        <div style={{ marginTop: '0.2rem' }}>
                          <a
                            href={w.websiteUrl || w.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="table-url-link"
                            style={{
                              maxWidth: '170px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={w.websiteUrl || w.url}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {w.websiteUrl || w.url}
                            </span>
                            <ExternalLink size={11} style={{ flexShrink: 0 }} />
                          </a>
                        </div>
                      </td>

                      <td style={{ verticalAlign: 'middle' }}>
                        {w.domainName ? (
                          <div>
                            <div
                              style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontWeight: 800,
                                fontSize: '0.84rem',
                                color: '#0284c7',
                                letterSpacing: '-0.01em',
                              }}
                            >
                              {w.domainName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                                {w.domainRegistrar || 'Registrar'}
                              </span>
                              {w.domainAutoRenew && (
                                <span
                                  style={{
                                    fontSize: '0.66rem',
                                    fontWeight: 800,
                                    padding: '0.12rem 0.45rem',
                                    borderRadius: '9999px',
                                    backgroundColor: '#ecfdf5',
                                    color: '#047857',
                                    border: '1px solid #a7f3d0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                  }}
                                >
                                  Auto-Renew
                                </span>
                              )}
                            </div>
                            {w.domainDocumentPdf && (
                              <div style={{ marginTop: '0.35rem' }}>
                                <a
                                  href={w.domainDocumentPdf}
                                  download={w.domainDocumentName || `${w.websiteName || 'domain'}_doc.pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '0.18rem 0.5rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    textDecoration: 'none',
                                    boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)',
                                  }}
                                  title={`Download ${w.domainDocumentName || 'Document'} (${w.domainDocumentSizeKb || 0} KB)`}
                                >
                                  <FileText size={10} />
                                  <span>PDF ({w.domainDocumentSizeKb ? `${w.domainDocumentSizeKb} KB` : 'Doc'})</span>
                                  <Download size={9} />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="table-null-state">
                              No domain registered
                            </span>
                            {w.domainDocumentPdf && (
                              <div style={{ marginTop: '0.35rem' }}>
                                <a
                                  href={w.domainDocumentPdf}
                                  download={w.domainDocumentName || 'document.pdf'}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '0.18rem 0.5rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <FileText size={10} />
                                  <span>PDF ({w.domainDocumentSizeKb ? `${w.domainDocumentSizeKb} KB` : 'Doc'})</span>
                                  <Download size={9} />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ verticalAlign: 'middle' }}>
                        {w.domainExpiryDate ? (
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                              {formatDateDisplay(w.domainExpiryDate)}
                            </div>
                            {days !== null && (
                              <div style={{ marginTop: '0.25rem' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.2rem 0.65rem',
                                    borderRadius: '9999px',
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
                                    backgroundColor: days < 0 ? '#fee2e2' : days <= 30 ? '#fef3c7' : '#ecfdf5',
                                    color: days < 0 ? '#b91c1c' : days <= 30 ? '#b45309' : '#047857',
                                    border: `1px solid ${days < 0 ? '#fca5a5' : days <= 30 ? '#fde68a' : '#a7f3d0'}`,
                                  }}
                                >
                                  <Clock size={11} />
                                  <span>{days < 0 ? `${Math.abs(days)}d Overdue` : `${days} days left`}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="table-empty-dash">—</span>
                        )}
                      </td>

                      <td style={{ verticalAlign: 'middle' }}>
                        <span
                          className={`status-pill ${
                            w.status === 'ACTIVE' || w.status === 'LIVE'
                              ? 'status-pill-green'
                              : w.status === 'DEVELOPMENT'
                              ? 'status-pill-blue'
                              : w.status === 'TESTING'
                              ? 'status-pill-yellow'
                              : 'status-pill-red'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            title="View Full Details"
                            onClick={() => setViewingWebsite(w)}
                            style={{
                              width: '30px',
                              height: '30px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '7px',
                              border: '1px solid #bae6fd',
                              backgroundColor: '#f0f9fd',
                              color: '#0284c7',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            title="Edit Details"
                            onClick={() => handleOpenEditWebsite(w)}
                            style={{
                              width: '30px',
                              height: '30px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '7px',
                              border: '1px solid var(--border-default)',
                              backgroundColor: '#ffffff',
                              color: '#0369a1',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Section C: Sales Questions awaiting Developer Response */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="#0284c7" />
              <span>Section C: Sales Questions & Technical Inquiries</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Answer technical feasibility inquiries directly for sales representatives
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="btn-pill"
            rightIcon={<ArrowRight size={14} />}
            onClick={() => setActiveDeveloperTab('sales-questions')}
          >
            All Questions ({salesQuestions.length})
          </Button>
        </div>

        {salesQuestions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No sales questions submitted yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {salesQuestions.slice(0, 4).map((q) => {
              const isAnswered = q.status === 'ANSWERED' || q.status === 'CLOSED';
              const isReplying = answeringQId === q.questionId;

              return (
                <div
                  key={q.id || q.questionId}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1.5px solid #e0f2fe',
                    backgroundColor: isAnswered ? '#f8fafc' : '#f0f9fd',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem', color: '#0284c7' }}>
                          {q.questionId}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: q.priority === 'HIGH' ? '#fee2e2' : q.priority === 'MEDIUM' ? '#ffedd5' : '#f0fdf4',
                            color: q.priority === 'HIGH' ? '#dc2626' : q.priority === 'MEDIUM' ? '#ea580c' : '#16a34a',
                            border: `1px solid ${q.priority === 'HIGH' ? '#fecaca' : q.priority === 'MEDIUM' ? '#fed7aa' : '#bbf7d0'}`,
                          }}
                        >
                          {q.priority} PRIORITY
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: isAnswered ? '#dcfce7' : '#fef3c7',
                            color: isAnswered ? '#15803d' : '#b45309',
                            border: `1px solid ${isAnswered ? '#bbf7d0' : '#fde68a'}`,
                          }}
                        >
                          {q.status}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {q.subject || q.question.slice(0, 60)}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                        {q.question}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                        Asked by: <strong style={{ color: 'var(--text-primary)' }}>{q.askedByName}</strong>
                      </span>
                      {q.websiteName && (
                        <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, display: 'block', marginTop: '0.15rem' }}>
                          Website: {q.websiteName}
                        </span>
                      )}
                    </div>
                  </div>

                  {q.answer && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        fontSize: '0.82rem',
                        color: '#065f46',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        <CheckCircle2 size={14} color="#059669" />
                        <span>Answer by {q.answeredByName || 'Developer'}:</span>
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.4 }}>{q.answer}</p>
                    </div>
                  )}

                  {!isAnswered && isReplying && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea
                        rows={3}
                        placeholder="Write your technical explanation, timeline estimate, or recommendations..."
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          border: '1px solid var(--border-default)',
                          backgroundColor: '#ffffff',
                          fontSize: '0.85rem',
                          outline: 'none',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAnsweringQId(null);
                            setAnswerContent('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Send size={13} />}
                          disabled={isSubmitting || !answerContent.trim()}
                          onClick={() => handleQuickAnswer(q.questionId)}
                        >
                          Submit Answer
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isAnswered && !isReplying && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-pill"
                        leftIcon={<Send size={13} />}
                        onClick={() => {
                          setAnsweringQId(q.questionId);
                          setAnswerContent('');
                        }}
                      >
                        Answer Question
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Section D: Engineering Notifications */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#0284c7" />
              <span>Section D: Engineering Notifications & System Alerts</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Real-time alerts: website deployments, domain expirations, sales technical inquiries
            </span>
          </div>


            <Button
              variant="ghost"
              size="sm"
              className="btn-pill"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => setActiveDeveloperTab('notifications')}
            >
              All Alerts ({notifications.length})
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.slice(0, 4).map((n) => {
              const isWarning = n.type === 'domain_expired' || n.type === 'domain_expiring_soon';
              const isAction = n.type === 'new_sales_question';
              const timeStr = new Date(n.createdAt || n.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={n.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: n.read ? '#ffffff' : '#f0f9fd',
                    border: `1.5px solid ${n.read ? 'var(--border-subtle)' : 'var(--border-default)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isWarning ? '#fee2e2' : isAction ? '#fef3c7' : '#e0f2fe',
                      color: isWarning ? '#dc2626' : isAction ? '#b45309' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {timeStr}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0', lineHeight: 1.35 }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* 5. Complete Website Details View Modal */}
      {viewingWebsite && (
        <Modal
          isOpen={!!viewingWebsite}
          onClose={() => setViewingWebsite(null)}
          title={`Website & Domain: ${viewingWebsite.websiteName || viewingWebsite.name}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: '#f0f9fd',
                border: '1.5px solid #bae6fd',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  {viewingWebsite.websiteId}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0' }}>
                  {viewingWebsite.websiteName || viewingWebsite.name}
                </h3>
                <a
                  href={viewingWebsite.websiteUrl || viewingWebsite.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.85rem',
                    color: '#0284c7',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'none',
                  }}
                >
                  <span>{viewingWebsite.websiteUrl || viewingWebsite.url}</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <span className="status-pill status-pill-green">{viewingWebsite.status}</span>
            </div>

            {/* Overview Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Client Account
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {viewingWebsite.customerName || 'Direct Client'}
                </div>
                {viewingWebsite.customerId && (
                  <div style={{ fontSize: '0.78rem', color: '#0284c7', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                    {viewingWebsite.customerId}
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Tech Stack & Type
                </span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {viewingWebsite.projectType || 'Full-Stack Web Application'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {viewingWebsite.technologyStack || 'Not specified'}
                </div>
              </div>
            </div>

            {/* Integrated Domain Section */}
            <div
              style={{
                padding: '1.15rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Server size={17} color="#0284c7" />
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Integrated Domain Details
                  </strong>
                </div>
                {viewingWebsite.domainStatus && (
                  <span className="status-pill status-pill-blue">
                    {viewingWebsite.domainStatus}
                  </span>
                )}
              </div>

              {viewingWebsite.domainName ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Domain Name:</span>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1' }}>
                        {viewingWebsite.domainName}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Registrar:</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {viewingWebsite.domainRegistrar || 'Custom'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Registration Date:</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {viewingWebsite.domainStartDate ? new Date(viewingWebsite.domainStartDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Expiration Date:</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b91c1c' }}>
                        {viewingWebsite.domainExpiryDate ? new Date(viewingWebsite.domainExpiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {viewingWebsite.domainExpiryDate && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        fontSize: '0.8rem',
                        color: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Clock size={15} />
                      <span>
                        Countdown: <strong>{viewingWebsite.daysRemaining ?? getDaysRemaining(viewingWebsite.domainExpiryDate)} days</strong> remaining until renewal
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No domain registered.</span>
              )}
            </div>

            {/* Client & Domain Document (PDF) */}
            <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <FileText size={15} color="#dc2626" />
                  <span>Client & Domain Document (PDF)</span>
                </div>
                {viewingWebsite.domainDocumentPdf ? (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid #86efac' }}>
                    Uploaded ({viewingWebsite.domainDocumentSizeKb || 0} KB)
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No Document</span>
                )}
              </div>

              {viewingWebsite.domainDocumentPdf ? (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '6px', backgroundColor: '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                      PDF
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>
                        {viewingWebsite.domainDocumentName || `${viewingWebsite.websiteName || 'domain'}_document.pdf`}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
                        Size: {viewingWebsite.domainDocumentSizeKb ? `${viewingWebsite.domainDocumentSizeKb} KB` : 'Small PDF'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={viewingWebsite.domainDocumentPdf}
                    download={viewingWebsite.domainDocumentName || `${viewingWebsite.websiteName || 'domain'}_doc.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.4rem 0 0', fontStyle: 'italic' }}>
                  No PDF document uploaded for this domain yet.
                </p>
              )}
            </div>

            {/* Internal notes */}
            {(viewingWebsite.description || viewingWebsite.internalNotes) && (
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Technical / Internal Notes
                </span>
                <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
                  {viewingWebsite.description || viewingWebsite.internalNotes}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" onClick={() => setViewingWebsite(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                leftIcon={<Edit2 size={13} />}
                onClick={() => {
                  const target = viewingWebsite;
                  setViewingWebsite(null);
                  handleOpenEditWebsite(target);
                }}
              >
                Edit Website & Domain Details
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Client Project Specifications & Requirements Modal */}
      {selectedCustomerForSpecs && (
        <Modal
          isOpen={!!selectedCustomerForSpecs}
          onClose={() => setSelectedCustomerForSpecs(null)}
          title={`Project Brief & Specifications: ${selectedCustomerForSpecs.company || selectedCustomerForSpecs.name}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            {/* Top Banner with Client Header & Right-Aligned Project Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.25rem',
                padding: '1.25rem',
                borderRadius: '14px',
                backgroundColor: '#f0f9fd',
                border: '1.5px solid #bae6fd',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {selectedCustomerForSpecs.customerId}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0 0.35rem 0' }}>
                  {selectedCustomerForSpecs.company || selectedCustomerForSpecs.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span>Contact: <strong>{selectedCustomerForSpecs.name}</strong></span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span>Email: {selectedCustomerForSpecs.email || 'N/A'}</span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span>Phone: {selectedCustomerForSpecs.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Status Selector pinned firmly to the Right Side */}
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  textAlign: 'right',
                  gap: '0.35rem',
                  backgroundColor: '#ffffff',
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #bae6fd',
                  boxShadow: '0 2px 5px rgba(2, 132, 199, 0.08)',
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Project Status
                </span>
                <select
                  value={selectedCustomerForSpecs.projectStatus || 'In Progress'}
                  disabled={isUpdatingStatusId === (selectedCustomerForSpecs.id || selectedCustomerForSpecs.customerId)}
                  onChange={(e) => handleUpdateProjectStatus(selectedCustomerForSpecs, e.target.value as ProjectStatus)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundColor: PROJECT_STATUS_CONFIG[selectedCustomerForSpecs.projectStatus || 'In Progress']?.bg || '#eff6ff',
                    color: PROJECT_STATUS_CONFIG[selectedCustomerForSpecs.projectStatus || 'In Progress']?.color || '#1d4ed8',
                    border: `1.5px solid ${PROJECT_STATUS_CONFIG[selectedCustomerForSpecs.projectStatus || 'In Progress']?.border || '#bfdbfe'}`,
                    borderRadius: '9999px',
                    padding: '0.35rem 1.85rem 0.35rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.6rem center',
                  }}
                >
                  {PROJECT_STATUS_LIST.map((status) => (
                    <option key={status} value={status} style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Service & Timeline Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Requested Service
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {selectedCustomerForSpecs.service || 'Web Application'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, marginTop: '0.15rem' }}>
                  Package: {selectedCustomerForSpecs.package || 'Standard'}
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Sales Representative
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {selectedCustomerForSpecs.salesMemberName || 'General Sales'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Source: {selectedCustomerForSpecs.leadSource || 'Organic'}
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Delivery Timeline
                </span>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {selectedCustomerForSpecs.startDate ? new Date(selectedCustomerForSpecs.startDate).toLocaleDateString() : 'N/A'} → {selectedCustomerForSpecs.endDate ? new Date(selectedCustomerForSpecs.endDate).toLocaleDateString() : 'Ongoing'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '0.15rem' }}>
                  Contract: {selectedCustomerForSpecs.status || 'Active'}
                </div>
              </div>
            </div>

            {/* Client Requirements & Specifications (Notes) */}
            <div style={{ padding: '1.15rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <FileText size={16} color="#0284c7" />
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Client Requirements & Scope of Work
                </strong>
              </div>
              <div
                style={{
                  fontSize: '0.86rem',
                  color: '#334155',
                  lineHeight: 1.5,
                  padding: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'pre-line',
                }}
              >
                {selectedCustomerForSpecs.notes || 'Standard package scope deliverables. Review client milestones and ensure production deployment on schedule.'}
              </div>
            </div>

            {/* Internal Remarks & Technical Directives */}
            {selectedCustomerForSpecs.internalRemarks && (
              <div style={{ padding: '1.15rem', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1.5px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <AlertCircle size={16} color="#b45309" />
                  <strong style={{ fontSize: '0.88rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Internal Technical Directives & Remarks
                  </strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#78350f', margin: 0, lineHeight: 1.45 }}>
                  {selectedCustomerForSpecs.internalRemarks}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button
                variant="outline"
                className="btn-pill"
                leftIcon={<Plus size={14} />}
                onClick={() => {
                  const targetCustId = selectedCustomerForSpecs.customerId;
                  setSelectedCustomerForSpecs(null);
                  handleOpenNewWebsite(targetCustId);
                }}
              >
                Record Production Website for this Client
              </Button>

              <Button variant="primary" onClick={() => setSelectedCustomerForSpecs(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Developer Website Details Form Modal (Website + Domain in ONE Form) */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={editingWebsite ? 'Edit Website & Domain Details' : 'Record Completed Client Website & Domain'}
          size="lg"
        >
          <form onSubmit={handleSubmitWebsite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            {formError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                }}
              >
                {formError}
              </div>
            )}

            {/* SECTION 1: Client Information */}
            <div style={{ padding: '1.15rem', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-default)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={16} color="#0284c7" />
                <span>1. Client Information</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Client Account
                  </label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="">-- Direct Client --</option>
                    {customers.map((c) => (
                      <option key={c.id || c.customerId} value={c.customerId}>
                        {c.name} {c.company ? `(${c.company})` : ''} - {c.customerId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Customer ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formCustomerId || 'N/A'}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#f1f5f9',
                      fontSize: '0.85rem',
                      color: '#475569',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Website Information */}
            <div style={{ padding: '1.15rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-default)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={16} color="#0284c7" />
                <span>2. Website Information</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Website Name * (e.g. ABC Business Website)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Business Website"
                    value={formWebsiteName}
                    onChange={(e) => setFormWebsiteName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Website URL * (e.g. https://abccompany.com)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://abccompany.com"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Project Type
                  </label>
                  <input
                    type="text"
                    value={formProjectType}
                    onChange={(e) => setFormProjectType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Website Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as WebsiteStatus)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="LIVE">LIVE</option>
                    <option value="DEVELOPMENT">DEVELOPMENT</option>
                    <option value="TESTING">TESTING</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Technology Stack
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js 15, TypeScript, MongoDB"
                    value={formTechStack}
                    onChange={(e) => setFormTechStack(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Repository URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formRepoUrl}
                    onChange={(e) => setFormRepoUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Technical & Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Architecture details, deployment runbooks, or staging credentials..."
                  value={formInternalNotes}
                  onChange={(e) => setFormInternalNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* SECTION 3: Domain Information — PART OF THE SAME FORM */}
            <div style={{ padding: '1.15rem', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Server size={16} color="#16a34a" />
                <span>3. Domain Information (Part of this Website Record)</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: '#14532d' }}>
                    Domain Name (e.g. abccompany.com)
                  </label>
                  <input
                    type="text"
                    placeholder="abccompany.com"
                    value={formDomainName}
                    onChange={(e) => setFormDomainName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: '#14532d' }}>
                    Registrar (e.g. GoDaddy, Namecheap)
                  </label>
                  <input
                    type="text"
                    placeholder="GoDaddy, Namecheap, Cloudflare"
                    value={formDomainRegistrar}
                    onChange={(e) => setFormDomainRegistrar(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: '#14532d' }}>
                    Domain Start Date / Registration Date
                  </label>
                  <input
                    type="date"
                    value={formDomainStartDate}
                    onChange={(e) => setFormDomainStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: '#14532d' }}>
                    Domain Expiry Date (Actual Expiry)
                  </label>
                  <input
                    type="date"
                    value={formDomainExpiryDate}
                    onChange={(e) => setFormDomainExpiryDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="devAutoRenewCheck"
                  checked={formDomainAutoRenew}
                  onChange={(e) => setFormDomainAutoRenew(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="devAutoRenewCheck" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532d', cursor: 'pointer' }}>
                  Auto Renewal Enabled with Registrar
                </label>
              </div>
            </div>

            {/* SECTION 4: Client & Domain Documentation (PDF) */}
            <div style={{ padding: '1.15rem', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991b1b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} color="#dc2626" />
                  <span>4. Client & Domain PDF Document (Max 500 KB)</span>
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>
                  Small Size in KB
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#7f1d1d', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
                Upload domain purchase invoice, ownership certificate, or client agreement in PDF format. Stored securely and visible to Admin.
              </p>

              {formDomainPdf ? (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                      }}
                    >
                      PDF
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1f2937' }}>
                        {formDomainPdfName || 'domain_document.pdf'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: '#dcfce7', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                          {formDomainPdfSizeKb} KB
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                          Verified under 500 KB limit
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a
                      href={formDomainPdf}
                      download={formDomainPdfName || 'document.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: '1px solid #fca5a5',
                      }}
                    >
                      <Download size={13} />
                      <span>Preview / Download</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#f3f4f6',
                        color: '#dc2626',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: '1px solid #d1d5db',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    style={{
                      border: '2px dashed #f87171',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                  >
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfUpload}
                      style={{ display: 'none' }}
                    />
                    <UploadCloud size={24} color="#dc2626" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991b1b' }}>
                      Click to choose Client & Domain PDF
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                      Accepts .pdf files only • Maximum file size: 500 KB
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="ghost" type="button" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving to Database...' : editingWebsite ? 'Update Website & Domain' : 'Save Website & Domain Details'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
