'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Website, WebsiteStatus } from '@/types';
import { Badge, Button, Input, Select, Modal, ConfirmDialog, SearchableSelect } from '@/components/ui';
import {
  Globe,
  Server,
  Search,
  Plus,
  Edit2,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  Trash2,
  Eye,
  FileText,
  Building2,
  Code,
  Lock,
  UploadCloud,
  Download,
} from 'lucide-react';

import { parseClientDisplay, formatDateDisplay } from '@/utils/formatters';
import { getSafeClickProps } from '@/utils/safeClick';

export default function WebsitesDomainsView() {
  const {
    currentUser,
    websites,
    customers,
    createWebsite,
    updateWebsite,
    deleteWebsite,
  } = useDashboard();

  const isSales = currentUser?.role === 'sales';
  const isAdmin = currentUser?.role === 'admin';
  const isDeveloper = currentUser?.role === 'developer';
  const isReadOnly = isSales;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');

  // Form Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);

  // Form Fields - Client Info
  const [formCustomerId, setFormCustomerId] = useState('');

  // Form Fields - Website Info
  const [formWebsiteName, setFormWebsiteName] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formProjectType, setFormProjectType] = useState('Full-Stack Web Application');
  const [formStatus, setFormStatus] = useState<WebsiteStatus>('DEVELOPMENT');
  const [formStartDate, setFormStartDate] = useState('');
  const [formTechStack, setFormTechStack] = useState('');
  const [formRepoUrl, setFormRepoUrl] = useState('');
  const [formDeploymentUrl, setFormDeploymentUrl] = useState('');
  const [formHostingProvider, setFormHostingProvider] = useState('');
  const [formHostingNotes, setFormHostingNotes] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInternalNotes, setFormInternalNotes] = useState('');

  // Form Fields - Domain Info (Part of the same form)
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
      setFormError(`PDF file size is too large (${sizeInKb} KB). Maximum allowed size is ${MAX_KB} KB.`);
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

  // Details View Modal
  const [viewingWebsite, setViewingWebsite] = useState<Website | null>(null);

  // Delete Dialog
  const [deletingWebsite, setDeletingWebsite] = useState<Website | null>(null);

  // Form Submit States
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic Domain calculation helper for UI preview
  const getCalculatedDays = (expiryStr: string) => {
    if (!expiryStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryStr);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getCalculatedStatus = (expiryStr: string) => {
    const days = getCalculatedDays(expiryStr);
    if (days === null) return 'ACTIVE';
    if (days < 0) return 'EXPIRED';
    if (days <= 30) return 'EXPIRING_SOON';
    return 'ACTIVE';
  };

  // Filtered Websites
  const filteredWebsites = websites.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    const wName = (w.websiteName || w.name || '').toLowerCase();
    const wUrl = (w.websiteUrl || w.url || '').toLowerCase();
    const cName = (w.customerName || '').toLowerCase();
    const cId = (w.customerId || '').toLowerCase();
    const dName = (w.domainName || '').toLowerCase();
    const dReg = (w.domainRegistrar || '').toLowerCase();
    const tech = (w.technologyStack || '').toLowerCase();

    const matchesSearch =
      !q ||
      wName.includes(q) ||
      wUrl.includes(q) ||
      w.websiteId.toLowerCase().includes(q) ||
      cName.includes(q) ||
      cId.includes(q) ||
      dName.includes(q) ||
      dReg.includes(q) ||
      tech.includes(q);

    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

    let matchesDomain = true;
    if (domainFilter !== 'all') {
      const dStatus = w.domainStatus || (w.domainExpiryDate ? getCalculatedStatus(w.domainExpiryDate) : 'ACTIVE');
      matchesDomain = dStatus === domainFilter;
    }

    return matchesSearch && matchesStatus && matchesDomain;
  });

  // Open Add Form Modal
  const handleOpenAddWebsite = () => {
    setEditingWebsite(null);
    setFormCustomerId(customers[0]?.customerId || '');
    setFormWebsiteName('');
    setFormWebsiteUrl('https://');
    setFormProjectType('Full-Stack Web Application');
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
    setFormDescription('');
    setFormInternalNotes('');

    // Domain fields
    setFormDomainName('');
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

  // Open Edit Form Modal
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

    // Domain fields
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

  // Handle Client Selection change
  const handleCustomerChange = (cid: string) => {
    setFormCustomerId(cid);
  };

  // Submit Website Details Form (Website + Domain together)
  const handleSubmitWebsiteForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formWebsiteName.trim()) {
      setFormError('Website name is required.');
      return;
    }
    if (!formWebsiteUrl.trim() || !formWebsiteUrl.startsWith('http')) {
      setFormError('Please enter a valid Website URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        // Website Information
        websiteName: formWebsiteName.trim(),
        websiteUrl: formWebsiteUrl.trim(),
        name: formWebsiteName.trim(),
        url: formWebsiteUrl.trim(),
        customerId: formCustomerId || undefined,
        projectType: formProjectType.trim() || 'Full-Stack Web Application',
        status: formStatus,
        startDate: formStartDate || new Date().toISOString().split('T')[0],
        technologyStack: formTechStack.trim(),
        repositoryUrl: formRepoUrl.trim(),
        deploymentUrl: formDeploymentUrl.trim(),
        hostingProvider: formHostingProvider.trim(),
        hostingNotes: formHostingNotes.trim(),
        description: formDescription.trim(),
        internalNotes: formInternalNotes.trim(),

        // Domain Information (PART OF THE SAME RECORD)
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
      setFormError(err.message || 'Failed to save website and domain details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingWebsite) return;
    setIsLoading(true);
    try {
      await deleteWebsite(deletingWebsite.id || deletingWebsite.websiteId);
      setDeletingWebsite(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete website');
    } finally {
      setIsLoading(false);
    }
  };

  // Selected customer helper
  const selectedCust = customers.find((c) => c.customerId === formCustomerId);

  // Live days calculation in form
  const formCalculatedDays = getCalculatedDays(formDomainExpiryDate);
  const formCalculatedStatus = getCalculatedStatus(formDomainExpiryDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
      {/* 1. Page Header */}
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
              gap: '0.45rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--brand-accent-text)',
              marginBottom: '0.25rem',
            }}
          >
            <Globe size={15} />
            <span>Engineering & Client Deployments</span>
          </div>
          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.25rem 0',
            }}
          >
            Websites & Domains
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Unified client websites, technical deployments, and integrated domain registrations with live expiration countdowns.
          </p>
        </div>

        {/* Add Actions (Hidden for Sales / Read-only) */}
        {!isReadOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="primary"
              size="md"
              className="btn-pill"
              leftIcon={<Plus size={16} />}
              onClick={handleOpenAddWebsite}
            >
              Record Completed Website
            </Button>
          </div>
        )}
      </div>

      {/* 2. Filter and Search Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by website, client, URL, domain, registrar, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.35rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-default)',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Site Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                backgroundColor: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="LIVE">Live</option>
              <option value="DEVELOPMENT">In Development</option>
              <option value="TESTING">Testing</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Domain Expiry:</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                backgroundColor: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="all">All Domains</option>
              <option value="ACTIVE">Active (&gt; 30d)</option>
              <option value="EXPIRING_SOON">Expiring Soon (≤ 30d)</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Unified Websites & Domains Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '105px', whiteSpace: 'nowrap' }}>Website ID</th>
              <th style={{ minWidth: '170px' }}>Client & Account</th>
              <th style={{ minWidth: '170px' }}>Website & URL</th>
              <th style={{ minWidth: '160px' }}>Domain & Registrar</th>
              <th style={{ minWidth: '145px' }}>Domain Expiry Countdown</th>
              <th style={{ width: '100px', minWidth: '100px' }}>Status</th>
              <th style={{ width: '115px', minWidth: '115px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWebsites.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  No website records found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredWebsites.map((w) => {
                const daysRemaining =
                  w.domainDaysRemaining ?? (w.domainExpiryDate ? getCalculatedDays(w.domainExpiryDate) : null);
                const clientInfo = parseClientDisplay(w.customerName);

                return (
                  <tr
                    key={w.id || w.websiteId}
                    {...getSafeClickProps(() => setViewingWebsite(w))}
                  >
                    {/* Website ID */}
                    <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span
                        className="table-id-tag"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingWebsite(w);
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Click to view details"
                      >
                        {w.websiteId}
                      </span>
                    </td>

                    {/* Client & Customer ID */}
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

                    {/* Website Name & URL */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="table-cell-title">
                        {w.websiteName || w.name}
                      </div>
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
                          <ExternalLink size={12} style={{ flexShrink: 0 }} />
                        </a>
                      </div>
                    </td>

                    {/* Domain & Registrar */}
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
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              marginTop: '0.25rem',
                              flexWrap: 'wrap',
                            }}
                          >
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
                                  transition: 'background-color 150ms ease',
                                }}
                                title={`Download ${w.domainDocumentName || 'Document'} (${w.domainDocumentSizeKb || 0} KB)`}
                              >
                                <FileText size={11} />
                                <span>PDF ({w.domainDocumentSizeKb ? `${w.domainDocumentSizeKb} KB` : 'Doc'})</span>
                                <Download size={10} />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="table-null-state">No domain registered</span>
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
                                <FileText size={11} />
                                <span>PDF ({w.domainDocumentSizeKb ? `${w.domainDocumentSizeKb} KB` : 'Doc'})</span>
                                <Download size={10} />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Domain Expiry & Countdown */}
                    <td style={{ verticalAlign: 'middle' }}>
                      {w.domainExpiryDate ? (
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                            {formatDateDisplay(w.domainExpiryDate)}
                          </div>
                          <div style={{ marginTop: '0.25rem' }}>
                            {daysRemaining !== null && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.2rem 0.65rem',
                                  borderRadius: '9999px',
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  backgroundColor:
                                    daysRemaining < 0
                                      ? '#fee2e2'
                                      : daysRemaining <= 30
                                      ? '#fef3c7'
                                      : '#ecfdf5',
                                  color:
                                    daysRemaining < 0
                                      ? '#b91c1c'
                                      : daysRemaining <= 30
                                      ? '#b45309'
                                      : '#047857',
                                  border: `1px solid ${
                                    daysRemaining < 0
                                      ? '#fca5a5'
                                      : daysRemaining <= 30
                                      ? '#fde68a'
                                      : '#a7f3d0'
                                  }`,
                                }}
                              >
                                <Clock size={11} />
                                <span>
                                  {daysRemaining < 0
                                    ? `${Math.abs(daysRemaining)}d Overdue`
                                    : `${daysRemaining} days left`}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="table-empty-dash">—</span>
                      )}
                    </td>

                    {/* Website Status */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <span
                        className={`status-pill ${
                          w.status === 'LIVE' || w.status === 'ACTIVE'
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

                    {/* Actions */}
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

                        {!isReadOnly && (
                          <button
                            title="Edit Website & Domain Details"
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
                        )}

                        {isAdmin && (
                          <button
                            title="Delete Website Record"
                            onClick={() => setDeletingWebsite(w)}
                            style={{
                              width: '30px',
                              height: '30px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '7px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Complete Website Details Modal (For Admin, Developer & Sales) */}
      {viewingWebsite && (
        <Modal
          isOpen={!!viewingWebsite}
          onClose={() => setViewingWebsite(null)}
          title={`Website & Domain Details: ${viewingWebsite.websiteName || viewingWebsite.name}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            {/* Header Badge Strip */}
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  className={`status-pill ${
                    viewingWebsite.status === 'LIVE' || viewingWebsite.status === 'ACTIVE'
                      ? 'status-pill-green'
                      : viewingWebsite.status === 'DEVELOPMENT'
                      ? 'status-pill-blue'
                      : viewingWebsite.status === 'TESTING'
                      ? 'status-pill-yellow'
                      : 'status-pill-red'
                  }`}
                >
                  {viewingWebsite.status}
                </span>
              </div>
            </div>

            {/* Grid 1: Client & Project Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <Building2 size={15} />
                  <span>Client Information</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {viewingWebsite.customerName || 'Direct Client'}
                  </div>
                  {viewingWebsite.customerId && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Customer ID: <strong style={{ color: '#0284c7' }}>{viewingWebsite.customerId}</strong>
                    </div>
                  )}
                  {viewingWebsite.customerCompany && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Company: <strong>{viewingWebsite.customerCompany}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <Layers size={15} />
                  <span>Project Overview</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {viewingWebsite.projectType || 'Full-Stack Web Application'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Start Date: <strong>{viewingWebsite.startDate || 'N/A'}</strong>
                  </div>
                  {viewingWebsite.technologyStack && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Tech Stack: <strong style={{ color: '#0f172a' }}>{viewingWebsite.technologyStack}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid 2: Integrated Domain Information Card */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Server size={18} color="#0284c7" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Integrated Domain Information
                  </h4>
                </div>

                {viewingWebsite.domainStatus && (
                  <span
                    className={`status-pill ${
                      viewingWebsite.domainStatus === 'ACTIVE'
                        ? 'status-pill-green'
                        : viewingWebsite.domainStatus === 'EXPIRING_SOON'
                        ? 'status-pill-yellow'
                        : 'status-pill-red'
                    }`}
                  >
                    Domain: {viewingWebsite.domainStatus}
                  </span>
                )}
              </div>

              {viewingWebsite.domainName ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Domain Name</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0369a1' }}>
                        {viewingWebsite.domainName}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Domain Registrar</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {viewingWebsite.domainRegistrar || 'Standard Registrar'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registration Date</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {viewingWebsite.domainStartDate ? new Date(viewingWebsite.domainStartDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expiration Date</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b91c1c' }}>
                        {viewingWebsite.domainExpiryDate ? new Date(viewingWebsite.domainExpiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Days remaining countdown alert box */}
                  {viewingWebsite.domainExpiryDate && (
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        backgroundColor:
                          (viewingWebsite.daysRemaining ?? 0) < 0
                            ? '#fee2e2'
                            : (viewingWebsite.daysRemaining ?? 0) <= 30
                            ? '#fffbeb'
                            : '#ecfdf5',
                        border: `1px solid ${
                          (viewingWebsite.daysRemaining ?? 0) < 0
                            ? '#fca5a5'
                            : (viewingWebsite.daysRemaining ?? 0) <= 30
                            ? '#fde68a'
                            : '#a7f3d0'
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock
                          size={18}
                          color={
                            (viewingWebsite.daysRemaining ?? 0) < 0
                              ? '#dc2626'
                              : (viewingWebsite.daysRemaining ?? 0) <= 30
                              ? '#b45309'
                              : '#059669'
                          }
                        />
                        <div>
                          <strong
                            style={{
                              fontSize: '0.85rem',
                              color:
                                (viewingWebsite.daysRemaining ?? 0) < 0
                                  ? '#b91c1c'
                                  : (viewingWebsite.daysRemaining ?? 0) <= 30
                                  ? '#b45309'
                                  : '#065f46',
                            }}
                          >
                            {(viewingWebsite.daysRemaining ?? 0) < 0
                              ? `Domain Expired (${Math.abs(viewingWebsite.daysRemaining ?? 0)} days ago)`
                              : (viewingWebsite.daysRemaining ?? 0) <= 30
                              ? `Domain Expiring Soon: ${viewingWebsite.daysRemaining} days remaining!`
                              : `Domain Active: ${viewingWebsite.daysRemaining} days remaining until renewal`}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block' }}>
                            Calculated dynamically from live expiry date ({new Date(viewingWebsite.domainExpiryDate).toLocaleDateString()})
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          backgroundColor: viewingWebsite.domainAutoRenew ? '#dcfce7' : '#f1f5f9',
                          color: viewingWebsite.domainAutoRenew ? '#15803d' : '#64748b',
                          border: `1px solid ${viewingWebsite.domainAutoRenew ? '#86efac' : '#cbd5e1'}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Auto-Renewal: {viewingWebsite.domainAutoRenew ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  )}

                  {viewingWebsite.domainNotes && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.75rem 0 0', fontStyle: 'italic' }}>
                      Domain Note: {viewingWebsite.domainNotes}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No domain information was recorded with this website yet.
                </div>
              )}
            </div>

            {/* Grid 2.5: Client & Domain Document (PDF) */}
            <div style={{ padding: '1.15rem', borderRadius: '14px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#0284c7', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <FileText size={16} color="#dc2626" />
                  <span>Client & Domain Document (PDF)</span>
                </div>
                {viewingWebsite.domainDocumentPdf ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid #86efac' }}>
                    Uploaded ({viewingWebsite.domainDocumentSizeKb || 0} KB)
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Document Uploaded</span>
                )}
              </div>

              {viewingWebsite.domainDocumentPdf ? (
                <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', padding: '0.85rem 1rem', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                      PDF
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991b1b' }}>
                        {viewingWebsite.domainDocumentName || `${viewingWebsite.websiteName || 'domain'}_document.pdf`}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                        File size: <strong>{viewingWebsite.domainDocumentSizeKb ? `${viewingWebsite.domainDocumentSizeKb} KB` : 'Small PDF'}</strong> (Verified under 500 KB limit)
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
                      gap: '0.4rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      padding: '0.45rem 0.95rem',
                      borderRadius: '8px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 0', fontStyle: 'italic' }}>
                  No PDF document has been attached to this website and domain yet.
                </p>
              )}
            </div>

            {/* Grid 3: Technical & Deployment Info */}
            <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <Code size={15} />
                <span>Technical & Deployment Details</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {viewingWebsite.repositoryUrl && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Repository URL:</span>
                    <div>
                      <a
                        href={viewingWebsite.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {viewingWebsite.repositoryUrl}
                      </a>
                    </div>
                  </div>
                )}

                {viewingWebsite.deploymentUrl && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deployment URL:</span>
                    <div>
                      <a
                        href={viewingWebsite.deploymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {viewingWebsite.deploymentUrl}
                      </a>
                    </div>
                  </div>
                )}

                {viewingWebsite.hostingProvider && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hosting Provider:</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {viewingWebsite.hostingProvider}
                    </div>
                  </div>
                )}
              </div>

              {/* Internal / Technical Notes */}
              {(viewingWebsite.description || viewingWebsite.internalNotes) && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Internal Engineering Notes:
                  </span>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                    {viewingWebsite.description || viewingWebsite.internalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="ghost" onClick={() => setViewingWebsite(null)}>
                Close
              </Button>
              {!isReadOnly && (
                <Button
                  variant="primary"
                  leftIcon={<Edit2 size={14} />}
                  onClick={() => {
                    const w = viewingWebsite;
                    setViewingWebsite(null);
                    handleOpenEditWebsite(w);
                  }}
                >
                  Edit Website & Domain Details
                </Button>
              )}
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
          <form onSubmit={handleSubmitWebsiteForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
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
            <div
              style={{
                padding: '1.15rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-default)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={16} color="#0284c7" />
                <span>1. Client Information</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <SearchableSelect
                    label="Client Account"
                    required
                    value={formCustomerId}
                    onChange={(val) => handleCustomerChange(val)}
                    placeholder="Search or select a client account..."
                    searchPlaceholder="Search client by name, company, or ID..."
                    options={[
                      { value: '', label: '-- Direct / Unassigned Client --' },
                      ...customers.map((c) => ({
                        value: c.customerId,
                        label: c.name,
                        subLabel: c.company,
                        badge: c.customerId,
                      })),
                    ]}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Customer ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formCustomerId || 'N/A (Direct Client)'}
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
            <div
              style={{
                padding: '1.15rem',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-default)',
              }}
            >
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
                  <select
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
                  >
                    <option value="Full-Stack Web Application">Full-Stack Web Application</option>
                    <option value="SaaS Platform">SaaS Platform</option>
                    <option value="Corporate Website">Corporate Website</option>
                    <option value="E-commerce Portal">E-commerce Portal</option>
                    <option value="Client Dashboard">Client Dashboard</option>
                    <option value="Mobile App Backend">Mobile App Backend</option>
                  </select>
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
                    <option value="ARCHIVED">ARCHIVED</option>
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
                    placeholder="e.g. Next.js 15, TypeScript, Tailwind, MongoDB"
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
                    placeholder="https://github.com/heptley-clients/..."
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Deployment / Staging URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://app.abccompany.com"
                    value={formDeploymentUrl}
                    onChange={(e) => setFormDeploymentUrl(e.target.value)}
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
                    Hosting Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vercel, AWS, DigitalOcean"
                    value={formHostingProvider}
                    onChange={(e) => setFormHostingProvider(e.target.value)}
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
                  Technical / Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Deployment instructions, architecture notes, or milestone comments..."
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
            <div
              style={{
                padding: '1.15rem',
                borderRadius: '12px',
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Server size={16} color="#16a34a" />
                  <span>3. Domain Information (Part of this Website Record)</span>
                </h4>

                {formDomainExpiryDate && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor:
                        formCalculatedDays !== null && formCalculatedDays < 0
                          ? '#fee2e2'
                          : formCalculatedDays !== null && formCalculatedDays <= 30
                          ? '#fef3c7'
                          : '#dcfce7',
                      color:
                        formCalculatedDays !== null && formCalculatedDays < 0
                          ? '#b91c1c'
                          : formCalculatedDays !== null && formCalculatedDays <= 30
                          ? '#b45309'
                          : '#15803d',
                      border: `1px solid ${
                        formCalculatedDays !== null && formCalculatedDays < 0
                          ? '#fca5a5'
                          : formCalculatedDays !== null && formCalculatedDays <= 30
                          ? '#fde68a'
                          : '#86efac'
                      }`,
                    }}
                  >
                    Calculated Status: {formCalculatedStatus}{' '}
                    {formCalculatedDays !== null
                      ? formCalculatedDays < 0
                        ? `(${Math.abs(formCalculatedDays)}d Overdue)`
                        : `(${formCalculatedDays} days remaining)`
                      : ''}
                  </span>
                )}
              </div>

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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="autoRenewCheck"
                  checked={formDomainAutoRenew}
                  onChange={(e) => setFormDomainAutoRenew(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="autoRenewCheck" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532d', cursor: 'pointer' }}>
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

            {/* Form Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="ghost" type="button" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Saving to Database...' : editingWebsite ? 'Update Website & Domain' : 'Save Website & Domain Details'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {deletingWebsite && (
        <ConfirmDialog
          isOpen={!!deletingWebsite}
          onClose={() => setDeletingWebsite(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Website Record"
          message={`Are you sure you want to delete website '${deletingWebsite.websiteName || deletingWebsite.name}' (${deletingWebsite.websiteId})? This will delete the website and its associated domain details from the database.`}
          confirmLabel="Delete Website"
          variant="danger"
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
