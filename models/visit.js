const Joi = require('joi');

// Joi validation schema for creating a customer
function visitValidation(visit) {
  const schema = Joi.object({
    status: Joi.valid('WAIT', 'START', 'END', 'CANCEL').optional().default('WAIT'),
    start_time: Joi.date().optional().allow(null),
    end_time: Joi.date().optional().allow(null),
    cancel_time: Joi.date().optional().allow(null),
    custId: Joi.number().required(),
    salesId: Joi.number().required(),
    // Also allow alternative field names for compatibility
    customer_id: Joi.number().optional(),
    salesman_id: Joi.number().optional()
  }).or('custId', 'customer_id').or('salesId', 'salesman_id');

return schema.validate(visit);

}

module.exports = {
  visitValidation,
};
