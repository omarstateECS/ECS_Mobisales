const Joi = require('joi');

// Joi validation schema for login
function LoginValidation(loginData) {
  const schema = Joi.object({
    id: Joi.number().required(),
    password: Joi.string().min(2).max(255).required(),
    deviceId: Joi.string().optional().allow('')
  });

  return schema.validate(loginData);
}

module.exports = {
  LoginValidation,
};
