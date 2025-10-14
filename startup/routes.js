require('dotenv').config();
const express = require("express");
const customersRoute = require('../routes/customer');
const productsRoute = require('../routes/products');
const salesmenRoute = require('../routes/salesman');
const authorityRoute = require('../routes/authority');
const visitsRoute = require('../routes/visit');
const authRoute = require('../routes/auth');
const settingsRoute = require('../routes/settings');

module.exports = function(app) { 
    app.use(express.json());
    app.use('/api/auth', authRoute);
    app.use('/api/customers', customersRoute);
    app.use('/api/products', productsRoute);
    app.use('/api/salesmen', salesmenRoute);
    app.use('/api/authorities', authorityRoute);
    app.use('/api/visits', visitsRoute);
    app.use('/api/settings', settingsRoute);
};
