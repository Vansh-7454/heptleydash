const Website = require('../models/Website');
const Customer = require('../models/Customer');

const calculateDaysRemaining = (expiryDateStr) => {
  if (!expiryDateStr) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const computeDomainStatus = (expiryDateStr) => {
  const days = calculateDaysRemaining(expiryDateStr);
  if (days < 0) return 'EXPIRED';
  if (days <= 30) return 'EXPIRING_SOON';
  return 'ACTIVE';
};

const domainController = {
  // GET /api/domains - Returns domain data sourced directly from Website records
  getAll: async (req, res, next) => {
    try {
      const websites = await Website.find({ domainName: { $exists: true, $ne: '' } }).sort({ domainExpiryDate: 1 });

      const domains = await Promise.all(
        websites.map(async (web) => {
          let customerName = '';
          if (web.customerId) {
            const customer = await Customer.findOne({ customerId: web.customerId }).select('name company');
            if (customer) customerName = `${customer.name} (${customer.company})`;
          }

          const days = web.getDaysRemaining ? web.getDaysRemaining() : calculateDaysRemaining(web.domainExpiryDate);
          const status = web.calculateDomainStatus ? web.calculateDomainStatus() : computeDomainStatus(web.domainExpiryDate);

          return {
            id: web._id.toString(),
            domainId: `DOM-${web.websiteId.replace('WEB-', '')}`,
            domainName: web.domainName,
            websiteId: web.websiteId,
            websiteName: web.websiteName,
            websiteUrl: web.websiteUrl,
            customerId: web.customerId,
            customerName,
            startDate: web.domainStartDate,
            expiryDate: web.domainExpiryDate,
            daysRemaining: days,
            status,
            registrar: web.domainRegistrar,
            autoRenew: web.domainAutoRenew,
            notes: web.domainNotes,
            createdAt: web.createdAt,
            updatedAt: web.updatedAt,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: domains.length,
        domains,
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const web = await Website.findOne({
        $or: [{ websiteId: id }, { domainName: id.toLowerCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
      });

      if (!web || !web.domainName) {
        return res.status(404).json({
          success: false,
          message: `Domain '${id}' not found.`,
        });
      }

      res.status(200).json({
        success: true,
        domain: {
          id: web._id.toString(),
          domainId: `DOM-${web.websiteId.replace('WEB-', '')}`,
          domainName: web.domainName,
          websiteId: web.websiteId,
          websiteName: web.websiteName,
          websiteUrl: web.websiteUrl,
          customerId: web.customerId,
          startDate: web.domainStartDate,
          expiryDate: web.domainExpiryDate,
          daysRemaining: web.getDaysRemaining ? web.getDaysRemaining() : calculateDaysRemaining(web.domainExpiryDate),
          status: web.calculateDomainStatus ? web.calculateDomainStatus() : computeDomainStatus(web.domainExpiryDate),
          registrar: web.domainRegistrar,
          autoRenew: web.domainAutoRenew,
          notes: web.domainNotes,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    res.status(400).json({
      success: false,
      message: 'Separate domain creation is disabled. Please create or update domain information through the Website record (/api/websites).',
    });
  },

  update: async (req, res, next) => {
    res.status(400).json({
      success: false,
      message: 'Separate domain updating is disabled. Please update domain information through the Website record (/api/websites).',
    });
  },

  delete: async (req, res, next) => {
    res.status(400).json({
      success: false,
      message: 'Separate domain deletion is disabled. Please manage domain information through the Website record (/api/websites).',
    });
  },
};

module.exports = domainController;
