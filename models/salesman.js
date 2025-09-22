const Joi = require('joi');

// Joi validation schema for creating a salesman
function SalesmanValidation(salesman) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    phone: Joi.string().min(10).max(20).required(),
    address: Joi.string().min(1).max(500).required(),
    password: Joi.string().min(6).max(255).required(),
    deviceId: Joi.string().min(1).max(100).required(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').default('INACTIVE')
  });

  return schema.validate(salesman);
}

module.exports = {
  SalesmanValidation,
};
