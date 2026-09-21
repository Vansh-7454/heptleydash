const Website = require('../models/Website');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const idService = require('../services/idService');
const domainExpiryService = require('../services/domainExpiryService');
const { getIO } = require('../socket');

/**
 * Calculates days remaining until domain expiry from the current date.
 */
const calculateDaysRemaining = (expiryDateStr) => {
  if (!expiryDateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Computes domain status from expiry date
 */
const computeDomainStatus = (expiryDateStr) => {
  if (!expiryDateStr) return 'ACTIVE';
  const days = calculateDaysRemaining(expiryDateStr);
  if (days === null) return 'ACTIVE';
  if (days < 0) return 'EXPIRED';
  if (days <= 30) return 'EXPIRING_SOON';
  return 'ACTIVE';
};

const formatDate = (dateVal) => {
  if (!dateVal) return '';
  if (dateVal instanceof Date) return dateVal.toISOString().split('T')[0];
  if (typeof dateVal === 'string') return dateVal.split('T')[0];
  return new Date(dateVal).toISOString().split('T')[0];
};

/**
 * Check and trigger domain expiry notification without duplicate notifications
 */
const checkAndTriggerDomainNotification = async (website) => {
  try {
    if (!website || !website.domainExpiryDate) return;

    // Trigger exact 30-day domain expiry notification for Admin and Developer if 30 days away
    await domainExpiryService.checkWebsiteDomainExpiry(website);

    const days = calculateDaysRemaining(website.domainExpiryDate);
    if (days === null || days > 30) return; // Not expiring soon, no notification needed

    let domainDisplay = (website.domainName || '').trim();
    if (!domainDisplay && website.websiteUrl) {
      try {
        const url = website.websiteUrl.startsWith('http') ? website.websiteUrl : `https://${website.websiteUrl}`;
        domainDisplay = new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {}
    }
    if (!domainDisplay) domainDisplay = website.websiteName || 'Domain';

    const notifType = days < 0 ? 'domain_expired' : 'domain_expiring_soon';
    const notifTitle =
      days < 0 ? `Domain Expired: ${domainDisplay}` : `Domain Expiring Soon: ${domainDisplay}`;
    const dateFormatted = domainExpiryService.formatReadableDate
      ? domainExpiryService.formatReadableDate(website.domainExpiryDate)
      : formatDate(website.domainExpiryDate);
    const notifMsg =
      days < 0
        ? `Domain ${domainDisplay} (${website.websiteName}) expired on ${dateFormatted}. Immediate renewal action required.`
        : `Domain ${domainDisplay} (${website.websiteName}) will expire in ${days} days on ${dateFormatted}.`;

    // Idempotent: check if notification already logged within the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existingNotif = await Notification.findOne({
      type: notifType,
      targetId: website.websiteId,
      createdAt: { $gte: sevenDaysAgo },
    });

    if (!existingNotif) {
      const newNotif = await Notification.create({
        recipientRole: 'all',
        type: notifType,
        title: notifTitle,
        message: notifMsg,
        targetTab: 'websites-domains',
        targetId: website.websiteId,
        read: false,
      });

      const io = getIO();
      if (io) {
        io.to('admin-room').emit('notification:new', newNotif);
        io.to('developer-room').emit('notification:new', newNotif);
      }
    }
  } catch (err) {
    console.warn('[checkAndTriggerDomainNotification] Error:', err.message);
  }
};

/**
 * Helper to serialize website document with complete website and integrated domain info
 */
const formatWebsiteResponse = (web, customer) => {
  const daysRemaining = calculateDaysRemaining(web.domainExpiryDate);
  const domainStatus = web.domainExpiryDate
    ? computeDomainStatus(web.domainExpiryDate)
    : web.domainStatus || 'ACTIVE';

  return {
    id: web._id.toString(),
    websiteId: web.websiteId,
    websiteName: web.websiteName,
    name: web.websiteName,
    websiteUrl: web.websiteUrl,
    url: web.websiteUrl,
    projectType: web.projectType,
    customerId: web.customerId,
    customerName: customer ? `${customer.name} (${customer.company})` : '',
    customerCompany: customer ? customer.company : '',
    status: web.status,
    startDate: web.startDate,
    hostingProvider: web.hostingProvider,
    hostingNotes: web.hostingNotes,
    repositoryUrl: web.repositoryUrl,
    deploymentUrl: web.deploymentUrl,
    technologyStack: web.technologyStack,
    description: web.description,
    internalNotes: web.internalNotes,

    // Integrated Domain Information
    domainName: web.domainName || '',
    domainStartDate: web.domainStartDate ? formatDate(web.domainStartDate) : '',
    domainExpiryDate: web.domainExpiryDate ? formatDate(web.domainExpiryDate) : '',
    domainRegistrar: web.domainRegistrar || '',
    domainAutoRenew: web.domainAutoRenew ?? false,
    domainStatus,
    domainDaysRemaining: daysRemaining,
    daysRemaining,
    domainNotes: web.domainNotes || '',
    domainDocumentPdf: web.domainDocumentPdf || '',
    domainDocumentName: web.domainDocumentName || '',
    domainDocumentSizeKb: web.domainDocumentSizeKb || 0,

    createdAt: web.createdAt,
    updatedAt: web.updatedAt,
  };
};

const websiteController = {
  // GET /api/websites
  getAll: async (req, res, next) => {
    try {
      const { customerId, status } = req.query;
      const query = {};

      if (customerId) query.customerId = customerId;
      if (status) query.status = status;

      const websites = await Website.find(query).sort({ createdAt: -1 });

      // Enrich each website with customer name and company
      const enrichedWebsites = await Promise.all(
        websites.map(async (web) => {
          const customer = web.customerId
            ? await Customer.findOne({ customerId: web.customerId }).select('name company')
            : null;
          return formatWebsiteResponse(web, customer);
        })
      );

      res.status(200).json({
        success: true,
        count: enrichedWebsites.length,
        websites: enrichedWebsites,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/websites/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('WEB-') ? { websiteId: id } : { _id: id };
      const web = await Website.findOne(query);

      if (!web) {
        return res.status(404).json({
          success: false,
          message: `Website '${id}' not found.`,
        });
      }

      const customer = web.customerId
        ? await Customer.findOne({ customerId: web.customerId })
        : null;

      res.status(200).json({
        success: true,
        website: formatWebsiteResponse(web, customer),
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/websites (Admin & Developer)
  create: async (req, res, next) => {
    try {
      const {
        websiteName,
        websiteUrl,
        name,
        url,
        projectType,
        customerId,
        status,
        startDate,
        hostingProvider,
        hostingNotes,
        repositoryUrl,
        deploymentUrl,
        technologyStack,
        description,
        internalNotes,

        // Integrated Domain Information (Part of same form)
        domainName,
        domainStartDate,
        domainExpiryDate,
        domainRegistrar,
        domainAutoRenew,
        domainNotes,
        domainDocumentPdf,
        domainDocumentName,
        domainDocumentSizeKb,
      } = req.body;

      const finalName = (websiteName || name || '').trim();
      const finalUrl = (websiteUrl || url || '').trim();

      if (!finalName || !finalUrl) {
        return res.status(400).json({
          success: false,
          message: 'Website Name and Website URL are required.',
        });
      }

      // Generate atomic WEB-000X
      const websiteId = await idService.getNextWebsiteId();

      // Parse and compute domain dates if provided
      const parsedDomainStart = domainStartDate ? new Date(domainStartDate) : null;
      const parsedDomainExpiry = domainExpiryDate ? new Date(domainExpiryDate) : null;
      const calculatedDomainStatus = parsedDomainExpiry ? computeDomainStatus(parsedDomainExpiry) : 'ACTIVE';

      const website = await Website.create({
        websiteId,
        websiteName: finalName,
        websiteUrl: finalUrl,
        projectType: projectType ? projectType.trim() : 'Full-Stack Web Application',
        customerId: customerId ? customerId.trim() : null,
        status: status || 'DEVELOPMENT',
        startDate: startDate ? startDate.trim() : new Date().toISOString().split('T')[0],
        hostingProvider: hostingProvider ? hostingProvider.trim() : '',
        hostingNotes: hostingNotes ? hostingNotes.trim() : '',
        repositoryUrl: repositoryUrl ? repositoryUrl.trim() : '',
        deploymentUrl: deploymentUrl ? deploymentUrl.trim() : '',
        technologyStack: technologyStack ? technologyStack.trim() : '',
        description: description ? description.trim() : '',
        internalNotes: internalNotes ? internalNotes.trim() : '',

        // Domain Fields
        domainName: domainName ? domainName.trim().toLowerCase() : '',
        domainStartDate: parsedDomainStart,
        domainExpiryDate: parsedDomainExpiry,
        domainRegistrar: domainRegistrar ? domainRegistrar.trim() : '',
        domainAutoRenew: domainAutoRenew === true || domainAutoRenew === 'true',
        domainStatus: calculatedDomainStatus,
        domainNotes: domainNotes ? domainNotes.trim() : '',
        domainDocumentPdf: domainDocumentPdf || '',
        domainDocumentName: domainDocumentName ? domainDocumentName.trim() : '',
        domainDocumentSizeKb: Number(domainDocumentSizeKb) || 0,

        createdBy: req.user.name || req.user.email || 'system',
      });

      // Enrich with customer info
      let customer = null;
      if (website.customerId) {
        customer = await Customer.findOne({ customerId: website.customerId }).select('name company');
      }

      const webObj = formatWebsiteResponse(website, customer);

      // Check for domain expiry alert
      if (website.domainExpiryDate) {
        await checkAndTriggerDomainNotification(website);
      }

      // Realtime Socket.IO emission
      const io = getIO();
      if (io) {
        io.to('admin-room').emit('website:created', webObj);
        io.to('developer-room').emit('website:created', webObj);
        io.to('sales-room').emit('website:created', webObj);
      }

      res.status(201).json({
        success: true,
        message: 'Website and domain record created successfully.',
        ...webObj,
        website: webObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/websites/:id (Admin & Developer)
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('WEB-') ? { websiteId: id } : { _id: id };
      const website = await Website.findOne(query);

      if (!website) {
        return res.status(404).json({
          success: false,
          message: `Website '${id}' not found.`,
        });
      }

      const allowedFields = [
        'websiteName',
        'websiteUrl',
        'projectType',
        'customerId',
        'status',
        'startDate',
        'hostingProvider',
        'hostingNotes',
        'repositoryUrl',
        'deploymentUrl',
        'technologyStack',
        'description',
        'internalNotes',
        'domainName',
        'domainRegistrar',
        'domainAutoRenew',
        'domainNotes',
        'domainDocumentPdf',
        'domainDocumentName',
        'domainDocumentSizeKb',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === 'domainAutoRenew') {
            website.domainAutoRenew = req.body[field] === true || req.body[field] === 'true';
          } else if (field === 'domainName') {
            website.domainName = req.body[field].trim().toLowerCase();
          } else if (field === 'domainDocumentSizeKb') {
            website.domainDocumentSizeKb = Number(req.body[field]) || 0;
          } else if (field === 'domainDocumentPdf') {
            website.domainDocumentPdf = req.body[field] || '';
          } else {
            website[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
          }
        }
      });

      // Handle domain dates
      if (req.body.domainStartDate !== undefined) {
        website.domainStartDate = req.body.domainStartDate ? new Date(req.body.domainStartDate) : null;
      }
      if (req.body.domainExpiryDate !== undefined) {
        website.domainExpiryDate = req.body.domainExpiryDate ? new Date(req.body.domainExpiryDate) : null;
        if (website.domainExpiryDate) {
          website.domainStatus = computeDomainStatus(website.domainExpiryDate);
        }
      }

      website.updatedBy = req.user.name || req.user.email || 'system';
      await website.save();

      // Check for domain expiry alert
      if (website.domainExpiryDate) {
        await checkAndTriggerDomainNotification(website);
      }

      let customer = null;
      if (website.customerId) {
        customer = await Customer.findOne({ customerId: website.customerId }).select('name company');
      }

      const webObj = formatWebsiteResponse(website, customer);

      const io = getIO();
      if (io) {
        io.to('admin-room').emit('website:updated', webObj);
        io.to('developer-room').emit('website:updated', webObj);
        io.to('sales-room').emit('website:updated', webObj);
      }

      res.status(200).json({
        success: true,
        message: 'Website and domain updated successfully.',
        website: webObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/websites/:id (Admin Only)
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('WEB-') ? { websiteId: id } : { _id: id };
      const website = await Website.findOne(query);

      if (!website) {
        return res.status(404).json({
          success: false,
          message: `Website '${id}' not found.`,
        });
      }

      await Website.deleteOne({ _id: website._id });

      const io = getIO();
      if (io) {
        io.to('admin-room').emit('website:deleted', { id: website._id.toString(), websiteId: website.websiteId });
        io.to('developer-room').emit('website:deleted', { id: website._id.toString(), websiteId: website.websiteId });
        io.to('sales-room').emit('website:deleted', { id: website._id.toString(), websiteId: website.websiteId });
      }

      res.status(200).json({
        success: true,
        message: `Website '${website.websiteId}' deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/websites/check-domain-expiry (Admin & Developer)
  checkExpiry: async (req, res, next) => {
    try {
      const summary = await domainExpiryService.checkDomainExpiry();
      res.status(200).json({
        success: true,
        message: 'Domain expiry check executed successfully.',
        summary,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = websiteController;
