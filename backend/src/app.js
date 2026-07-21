const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

const app = express();

// Configure Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount Routes
app.use('/', routes);

// Handle undefined routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server.`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
