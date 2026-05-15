import express from 'express';
import orderRoute from './order.route.js';
import apiRoute  from './api.route.js'; 
import healthRoute from './health.route.js';

const router = express.Router();


// Routes
router.use('/order', orderRoute);

//microservice
router.use('/msv', apiRoute);

// Health check
router.use('/health',healthRoute);



export default router;