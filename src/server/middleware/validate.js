const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}`,
      });
    }

    next();
  };
};

const validateEmail = (email) => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email.trim());
};

module.exports = {
  validateRequired,
  validateEmail,
};
