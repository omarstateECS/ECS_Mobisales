const Joi = require('joi');

// Joi validation schema for login
function LoginValidation(loginData) {
  const schema = Joi.object({
    phone: Joi.string().min(10).max(20).required(),
    password: Joi.string().min(1).max(255).required()
  });

  return schema.validate(loginData);
}

module.exports = {
  LoginValidation,
};
