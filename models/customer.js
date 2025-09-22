const Joi = require('joi');

// Joi validation schema for creating a customer
function customerValidation(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    industry: Joi.string().optional().allow(null),
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    phone: Joi.string().optional().allow(null),
});

return schema.validate(customer);

}

module.exports = {
  customerValidation,
};
