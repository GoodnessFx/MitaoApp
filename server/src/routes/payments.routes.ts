import { Router } from 'express';

export const paymentRoutes = Router();

// These endpoints handle provider webhooks
paymentRoutes.post('/webhook/paystack', (req, res) => {
  // Verify signature and update order payment status
  res.send('OK');
});

paymentRoutes.post('/webhook/flutterwave', (req, res) => {
  // Verify signature and update order payment status
  res.send('OK');
});

paymentRoutes.post('/webhook/stripe', (req, res) => {
  // Verify signature and update order payment status
  res.send('OK');
});
