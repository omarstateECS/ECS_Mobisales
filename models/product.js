const Joi = require('joi');

// Joi validation schema for creating a product
function productValidation(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().optional().allow(null),
    barcode: Joi.string().unique().required(),
    category: Joi.string().required(),
    brand: Joi.string().required(),
});

return schema.validate(product);

}

module.exports = {
  productValidation,
};
