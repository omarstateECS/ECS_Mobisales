const Joi = require('joi');

// Joi validation schema for creating a salesman
function SalesmanValidation(salesman) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    phone: Joi.string().min(10).max(20).required(),
    address: Joi.string().min(1).max(500).required(),
    password: Joi.string().min(1).max(255).required(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').default('INACTIVE'),
    regionId: Joi.number().integer().positive().optional().allow(null), // Backward compatibility
    regionIds: Joi.array().items(Joi.number().integer().positive()).optional() // Support multiple regions
  });

  return schema.validate(salesman);
}

module.exports = {
  SalesmanValidation,
};
