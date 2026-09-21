const Website = require('../models/Website');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { emitNotification } = require('../socket');

/**
 * Calculates calendar days until expiry from a base date.
 * Normalizes both dates to local calendar midnight (00:00:00.000)
 * to prevent time-of-day offsets or partial day inaccuracies.
 */
const calculateDaysUntilExpiry = (expiryDate, baseDate = new Date()) => {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate);
  if (isNaN(exp.getTime())) return null;

  const d1 = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const d2 = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());

  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Formats a date into a clean, human-readable string (e.g., "21 Oct 2026")
 */
const formatReadableDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Resolves a domain name from the website record, falling back to websiteUrl hostname
 * or websiteName if domainName was not explicitly entered.
 */
const resolveDomainName = (website) => {
  if (website?.domainName && website.domainName.trim()) {
    return website.domainName.trim();
  }
  if (website?.websiteUrl) {
    try {
      const url = website.websiteUrl.startsWith('http') ? website.websiteUrl : `https://${website.websiteUrl}`;
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      if (hostname) return hostname;
    } catch (e) {
      // ignore invalid url
    }
  }
  return website?.websiteName || 'Registered Domain';
};

/**
 * Checks a single website record and creates/dispatches 30-day expiry notifications
 * for both Admin and the shared Developer account if exactly 30 days away.
 * Strictly prevents duplicate notifications for the same expiry cycle.
 */
const checkWebsiteDomainExpiry = async (website, baseDate = new Date()) => {
  try {
    if (!website || !website.domainExpiryDate) {
      return { triggered: false, reason: 'missing_expiry_date' };
    }

    const domainName = resolveDomainName(website);

    const daysRemaining = calculateDaysUntilExpiry(website.domainExpiryDate, baseDate);
    if (daysRemaining === null) {
      console.warn(`[domainExpiryService] Invalid domainExpiryDate for website ${website.websiteId}:`, website.domainExpiryDate);
      return { triggered: false, reason: 'invalid_date' };
    }

    // Must be EXACTLY 30 days
    if (daysRemaining !== 30) {
      return { triggered: false, daysRemaining };
    }

    // Resolve client details for context
    let clientName = 'Client';
    if (website.customerId) {
      const customer = await Customer.findOne({ customerId: website.customerId }).select('name company');
      if (customer) {
        clientName = customer.company || customer.name || 'Client';
      }
    }

    const formattedDate = formatReadableDate(website.domainExpiryDate);
    const registrarText = website.domainRegistrar ? ` Registrar: ${website.domainRegistrar}.` : '';
    const websiteContext =
      website.websiteName && website.websiteName.toLowerCase() !== domainName.toLowerCase()
        ? ` (${website.websiteName})`
        : '';

    const title = `Domain Expiring Soon: ${domainName}`;
    const message = `Domain ${domainName}${websiteContext} for ${clientName} expires in 30 days on ${formattedDate}.${registrarText ? ' ' + registrarText : ''}`;

    // Normalize expiry cycle for duplicate detection (calendar day range)
    const expDate = new Date(website.domainExpiryDate);
    const cycleStart = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
    const cycleEnd = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate() + 1);

    const recipients = ['admin', 'developer'];
    const createdNotifications = [];

    for (const role of recipients) {
      // 1. Check if a 30-day reminder already exists for this website, recipient, and expiry cycle
      const existing = await Notification.findOne({
        type: 'DOMAIN_EXPIRY_30_DAYS',
        targetId: website.websiteId,
        recipientRole: role,
        domainExpiryDate: { $gte: cycleStart, $lt: cycleEnd },
      });

      if (existing) {
        // Notification already sent for this cycle to this recipient - prevent duplicate
        continue;
      }

      // 2. Persist notification in MongoDB
      const notif = await Notification.create({
        recipientRole: role,
        type: 'DOMAIN_EXPIRY_30_DAYS',
        title,
        message,
        targetTab: 'websites-domains',
        targetId: website.websiteId,
        domainName,
        domainExpiryDate: website.domainExpiryDate,
        read: false,
      });

      // 3. Emit in real-time via Socket.IO
      try {
        emitNotification(notif);
      } catch (socketErr) {
        console.warn(`[domainExpiryService] Socket emission error for ${role}:`, socketErr.message);
      }

      createdNotifications.push(notif);
      console.log(`[domainExpiryService] 30-day domain expiry alert created for ${role.toUpperCase()}: ${domainName} (ID: ${website.websiteId})`);
    }

    return {
      triggered: true,
      daysRemaining: 30,
      websiteId: website.websiteId,
      domainName,
      createdCount: createdNotifications.length,
      notifications: createdNotifications,
    };
  } catch (err) {
    console.error(`[domainExpiryService] Error checking website ${website?.websiteId}:`, err);
    return { triggered: false, error: err.message };
  }
};

/**
 * Scans all websites in MongoDB and evaluates domain expiry.
 * Called on startup, on schedule, or via on-demand trigger.
 */
const checkDomainExpiry = async (baseDate = new Date()) => {
  try {
    const websites = await Website.find({
      domainExpiryDate: { $exists: true, $ne: null },
    });

    let triggeredCount = 0;
    let newNotificationsCount = 0;

    for (const website of websites) {
      const result = await checkWebsiteDomainExpiry(website, baseDate);
      if (result.triggered) {
        triggeredCount++;
        newNotificationsCount += result.createdCount || 0;
      }
    }

    return {
      success: true,
      scannedWebsites: websites.length,
      triggeredWebsites: triggeredCount,
      newNotificationsCount,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[domainExpiryService] Error executing batch check:', err);
    throw err;
  }
};

let schedulerInterval = null;

/**
 * Initializes the background scheduled job to periodically check domain expiries.
 */
const startDomainExpiryScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  console.log('[domainExpiryService] Starting Domain Expiry Scheduler (Daily 30-Day Check)...');

  // Run initial check on server startup (delayed by 3 seconds to ensure DB & sockets are ready)
  setTimeout(async () => {
    try {
      const summary = await checkDomainExpiry();
      console.log(`[domainExpiryService] Startup check complete: ${summary.scannedWebsites} domains scanned, ${summary.newNotificationsCount} new alerts generated.`);
    } catch (err) {
      console.error('[domainExpiryService] Initial check failed:', err.message);
    }
  }, 3000);

  // Periodic recurring check every 1 hour (catches day boundaries smoothly without waiting 24 full hours)
  const ONE_HOUR_MS = 60 * 60 * 1000;
  schedulerInterval = setInterval(async () => {
    try {
      const summary = await checkDomainExpiry();
      if (summary.newNotificationsCount > 0) {
        console.log(`[domainExpiryService] Scheduled check complete: ${summary.newNotificationsCount} domain expiry notifications generated.`);
      }
    } catch (err) {
      console.error('[domainExpiryService] Scheduled check failed:', err.message);
    }
  }, ONE_HOUR_MS);

  if (schedulerInterval.unref) {
    schedulerInterval.unref();
  }
};

const stopDomainExpiryScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};

module.exports = {
  calculateDaysUntilExpiry,
  formatReadableDate,
  checkWebsiteDomainExpiry,
  checkDomainExpiry,
  startDomainExpiryScheduler,
  stopDomainExpiryScheduler,
};
