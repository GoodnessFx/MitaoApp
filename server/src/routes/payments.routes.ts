import { Prisma, PrismaClient } from '@prisma/client';
import { Router } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { ProcurementService } from '../sourcing/procurement.service';

const PAYMENT_PROVIDER_BASE_URLS = {
  paystack: 'https://api.paystack.co',
  flutterwave: 'https://api.flutterwave.com',
} as const;
import {
  getEventMetadata,
  getEventReference,
  verifyFlutterwaveSignature,
  verifyPaystackSignature,
} from '../utils/payment-webhooks';

const prisma = new PrismaClient();
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

const initiatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  provider: z.enum(['paystack', 'flutterwave', 'stripe']),
});

function asSingleHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getRawRequestBody(req: any) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  return Buffer.from(JSON.stringify(req.body ?? {}), 'utf8');
}

async function findOrderByPaymentReference(provider: string, payload: any) {
  const reference = getEventReference(payload);
  const metadata = getEventMetadata(payload);
  const providerTransactionId = payload?.data?.id || payload?.data?.transaction_id || payload?.data?.txid || payload?.data?.flwRef || payload?.data?.transactionId;
  const orderIdFromMetadata = metadata.orderId ?? metadata.order_id ?? payload?.data?.orderId ?? payload?.data?.order_id;

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        ...(providerTransactionId ? [{ providerTransactionId: String(providerTransactionId) }] : []),
        ...(reference ? [{ metadata: { path: ['reference'], equals: reference } }] : []),
        ...(reference ? [{ metadata: { path: ['tx_ref'], equals: reference } }] : []),
        ...(orderIdFromMetadata ? [{ orderId: String(orderIdFromMetadata) }] : []),
      ],
      ...(provider ? { provider } : {}),
    },
    include: { order: true },
  });

  return payment?.order ?? null;
}

async function recordWebhookPayment(
  provider: 'paystack' | 'flutterwave' | 'stripe',
  payload: any,
  status: 'success' | 'failed' | 'pending',
) {
  const metadata = getEventMetadata(payload);
  const reference = getEventReference(payload) ?? metadata.reference ?? metadata.tx_ref ?? metadata.flwRef ?? metadata.orderId ?? metadata.order_id;
  const providerTransactionId =
    payload?.data?.id ||
    payload?.data?.transaction_id ||
    payload?.data?.txid ||
    payload?.data?.flwRef ||
    payload?.data?.transactionId ||
    payload?.id ||
    payload?.transaction_id ||
    payload?.tx_ref ||
    null;

  const order = await findOrderByPaymentReference(provider, payload);
  if (!order) {
    return { processed: false, reason: 'order-not-found' };
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      OR: [
        ...(providerTransactionId ? [{ providerTransactionId: String(providerTransactionId) }] : []),
        ...(reference ? [{ metadata: { path: ['reference'], equals: reference } }] : []),
      ],
      orderId: order.id,
    },
    include: { order: true },
  });

  if (existingPayment && existingPayment.status === 'success' && status === 'success') {
    return { processed: false, reason: 'already-processed', orderId: order.id };
  }

  const amountValue =
    Number(payload?.data?.amount ?? payload?.amount ?? order.total ?? 0) || 0;
  const currencyValue = String(payload?.data?.currency ?? payload?.currency ?? order.currency ?? 'NGN');

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        providerTransactionId: providerTransactionId ? String(providerTransactionId) : existingPayment.providerTransactionId,
        amount: new Prisma.Decimal(amountValue),
        currency: currencyValue,
        status,
        metadata: {
          ...(existingPayment.metadata as Record<string, unknown> | null),
          ...(metadata || {}),
          reference,
          orderId: order.id,
          provider,
        },
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider,
        providerTransactionId: providerTransactionId ? String(providerTransactionId) : undefined,
        amount: new Prisma.Decimal(amountValue),
        currency: currencyValue,
        status,
        metadata: {
          ...(metadata || {}),
          reference,
          orderId: order.id,
          provider,
        },
      },
    });
  }

  if (status === 'success') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'Processing',
        notes: `Payment confirmed via ${provider}.`,
      },
    });

    await ProcurementService.processCustomerOrder(order.id);
  }

  return { processed: true, orderId: order.id };
}

export const paymentRoutes = Router();

paymentRoutes.post('/initiate', requireAuth, async (req, res, next) => {
  try {
    const data = initiatePaymentSchema.parse(req.body);
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, userId: req.user!.id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const reference = `mitao_${data.provider}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const providerConfig = {
      paystack: !!env.PAYSTACK_SECRET_KEY,
      flutterwave: !!env.FLUTTERWAVE_SECRET_KEY && !!env.FLUTTERWAVE_PUBLIC_KEY,
      stripe: !!env.STRIPE_WEBHOOK_SECRET && !!env.STRIPE_SECRET_KEY,
    };

    if (!providerConfig[data.provider]) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: data.provider,
          amount: new Prisma.Decimal(order.total.toString()),
          currency: order.currency,
          status: 'pending',
          metadata: {
            reference,
            orderId: order.id,
            provider: data.provider,
            message: 'Hosted provider not configured in this environment.',
          },
        },
      });

      return res.status(200).json({
        provider: data.provider,
        reference,
        status: 'pending-setup',
        message: 'Payment provider is configured in the deployment environment but not yet set up in this sandbox build.',
      });
    }

    let paymentUrl = '';
    if (data.provider === 'paystack') {
      const response = await fetch(`${PAYMENT_PROVIDER_BASE_URLS.paystack}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email: req.user?.email || 'customer@mitao.app',
          amount: Math.round(Number(order.total) * 100),
          currency: order.currency,
          reference,
          callback_url: `${env.FRONTEND_URL}/checkout?status=success&provider=paystack&reference=${encodeURIComponent(reference)}`,
          metadata: {
            orderId: order.id,
            provider: data.provider,
            orderNumber: order.orderNumber,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.data?.authorization_url) {
        throw new Error(payload?.message || 'Paystack initialization failed.');
      }
      paymentUrl = payload.data.authorization_url;
    }

    if (data.provider === 'flutterwave') {
      const response = await fetch(`${PAYMENT_PROVIDER_BASE_URLS.flutterwave}/v3/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount: Number(order.total),
          currency: order.currency,
          redirect_url: `${env.FRONTEND_URL}/checkout?status=success&provider=flutterwave&reference=${encodeURIComponent(reference)}`,
          payment_options: 'card',
          customer: {
            email: req.user?.email || 'customer@mitao.app',
            name: req.user?.email || 'Mitao customer',
          },
          customizations: {
            title: 'Mitao Checkout',
            description: `Order ${order.orderNumber}`,
            logo: `${env.FRONTEND_URL}/favicon.ico`,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.data?.link) {
        throw new Error(payload?.message || 'Flutterwave initialization failed.');
      }
      paymentUrl = payload.data.link;
    }

    if (data.provider === 'stripe') {
      paymentUrl = `${env.FRONTEND_URL}/checkout?status=success&provider=stripe&reference=${encodeURIComponent(reference)}`;
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: data.provider,
        amount: new Prisma.Decimal(order.total.toString()),
        currency: order.currency,
        status: 'pending',
        metadata: {
          reference,
          orderId: order.id,
          provider: data.provider,
          redirectUrl: paymentUrl,
        },
      },
    });

    res.status(200).json({
      provider: data.provider,
      reference,
      status: 'pending',
      orderId: order.id,
      amount: Number(order.total),
      currency: order.currency,
      url: paymentUrl,
      authorization_url: paymentUrl,
      checkoutUrl: paymentUrl,
    });
  } catch (error) {
    next(error);
  }
});

paymentRoutes.post('/webhook/paystack', async (req, res) => {
  const rawBody = getRawRequestBody(req);
  const signature = asSingleHeader(req.headers['x-paystack-signature']);
  const isValid = verifyPaystackSignature(rawBody, env.PAYSTACK_SECRET_KEY, signature);

  if (!env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'PAYSTACK_SECRET_KEY is missing from the deployment environment.' });
  }

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid Paystack webhook signature.' });
  }

  try {
    const payload = JSON.parse(rawBody.toString('utf8'));
    const event = payload?.event;

    if (event === 'charge.success') {
      await recordWebhookPayment('paystack', payload, 'success');
      return res.sendStatus(200);
    }

    if (event && event.includes('failed')) {
      await recordWebhookPayment('paystack', payload, 'failed');
      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('[Webhook][Paystack] failed to parse payload', error);
    return res.status(400).json({ error: 'Invalid Paystack payload.' });
  }
});

paymentRoutes.post('/webhook/flutterwave', async (req, res) => {
  const rawBody = getRawRequestBody(req);
  const signature = asSingleHeader(req.headers['verif-hash']);

  if (!env.FLUTTERWAVE_SECRET_HASH) {
    return res.status(500).json({ error: 'FLUTTERWAVE_SECRET_HASH is missing from the deployment environment.' });
  }

  const isValid = verifyFlutterwaveSignature(rawBody, env.FLUTTERWAVE_SECRET_HASH, signature);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid Flutterwave webhook signature.' });
  }

  try {
    const payload = JSON.parse(rawBody.toString('utf8'));
    const status = payload?.status ?? payload?.event ?? 'pending';
    const isSuccessful = status === 'successful' || status === 'completed' || payload?.event === 'charge.completed';

    if (isSuccessful) {
      await recordWebhookPayment('flutterwave', payload, 'success');
      return res.sendStatus(200);
    }

    if (status === 'failed' || status === 'cancelled') {
      await recordWebhookPayment('flutterwave', payload, 'failed');
      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('[Webhook][Flutterwave] failed to parse payload', error);
    return res.status(400).json({ error: 'Invalid Flutterwave payload.' });
  }
});

paymentRoutes.post('/webhook/stripe', async (req, res) => {
  const signature = asSingleHeader(req.headers['stripe-signature']);

  if (!env.STRIPE_WEBHOOK_SECRET || !stripe) {
    return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY is missing from the deployment environment.' });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body as Buffer, signature ?? '', env.STRIPE_WEBHOOK_SECRET);
    const object = event.data.object as any;

    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const payload = {
        data: {
          ...object,
          id: object.id,
          amount: object.amount_total ?? object.amount ?? 0,
          currency: object.currency ?? 'NGN',
          orderId: object.metadata?.orderId ?? object.metadata?.order_id,
          reference: object.metadata?.reference ?? object.client_reference_id,
        },
        event: event.type,
      };
      await recordWebhookPayment('stripe', payload, 'success');
      return res.json({ received: true });
    }

    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
      const payload = {
        data: {
          ...object,
          id: object.id,
          amount: object.amount_total ?? object.amount ?? 0,
          currency: object.currency ?? 'NGN',
          orderId: object.metadata?.orderId ?? object.metadata?.order_id,
          reference: object.metadata?.reference ?? object.client_reference_id,
          transaction_id: object.payment_intent ?? object.id,
        },
        event: event.type,
      };
      await recordWebhookPayment('stripe', payload, 'failed');
      return res.json({ received: true });
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('[Webhook][Stripe] signature verification failed', error);
    return res.status(400).json({ error: 'Stripe webhook signature verification failed.' });
  }
});
